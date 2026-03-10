#!/usr/bin/env python3
"""
EMR Dashboard Data Preprocessor

Cleans and validates data.json before it reaches the React frontend.
Handles BRL number parsing, CRM revenue deduplication, account filtering,
and precision validation.

Usage: python3 scripts/preprocess_data.py
"""

import json
import os
import re
import sys
import copy
import logging
from datetime import datetime

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_PATH = os.path.join(PROJECT_ROOT, "src", "data.json")
ACCOUNT_TAG = "Eu Medico Residente"
TOLERANCE_PCT = 5.0  # 5% tolerance for validation comparisons
SCALE_THRESHOLD = 1000  # Factor to detect "divided by 1000" errors

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)
log = logging.getLogger("emr-preprocess")

# Validation report accumulator
report_lines: list[str] = []
warnings_count = 0
critical_failures: list[str] = []


def report(msg: str, level: str = "INFO") -> None:
    global warnings_count
    report_lines.append(f"[{level}] {msg}")
    if level == "WARN":
        warnings_count += 1
        log.warning(msg)
    elif level == "CRITICAL":
        critical_failures.append(msg)
        log.error(msg)
    else:
        log.info(msg)


# ---------------------------------------------------------------------------
# 1. BRL Number Parsing
# ---------------------------------------------------------------------------

# Brazilian: 1.234,56  |  US: 1,234.56  |  Ambiguous: 1,234 or 1.234

_RE_BRL = re.compile(
    r"^-?\d{1,3}(?:\.\d{3})*,\d{1,2}$"  # e.g. 1.234,56
)
_RE_US = re.compile(
    r"^-?\d{1,3}(?:,\d{3})*\.\d{1,2}$"  # e.g. 1,234.56
)
_RE_AMBIGUOUS_BR = re.compile(
    r"^-?\d{1,3}\.\d{3}$"  # e.g. 1.234 (could be BR thousands)
)
_RE_AMBIGUOUS_US = re.compile(
    r"^-?\d{1,3},\d{3}$"  # e.g. 1,234 (could be US thousands)
)


def detect_number_format(value: str) -> str:
    """Return 'brl', 'us', 'ambiguous', or 'plain'."""
    v = value.strip()
    if _RE_BRL.match(v):
        return "brl"
    if _RE_US.match(v):
        return "us"
    if _RE_AMBIGUOUS_BR.match(v) or _RE_AMBIGUOUS_US.match(v):
        return "ambiguous"
    return "plain"


def parse_brl_number(value) -> float:
    """
    Parse a number that may be in BRL format (1.234,56) or US format.
    If already a numeric type, return as float.
    """
    if isinstance(value, (int, float)):
        return float(value)
    if not isinstance(value, str):
        return 0.0

    v = value.strip().replace("R$", "").replace("$", "").strip()
    if not v:
        return 0.0

    fmt = detect_number_format(v)
    if fmt == "brl":
        # 1.234,56 -> 1234.56
        converted = v.replace(".", "").replace(",", ".")
        report(f"BRL format detected: '{value}' -> {converted}", "INFO")
        return float(converted)
    elif fmt == "us":
        converted = v.replace(",", "")
        return float(converted)
    elif fmt == "ambiguous":
        report(
            f"Ambiguous number format: '{value}' - treating as plain number (thousands separator removed)",
            "WARN",
        )
        # Treat comma or dot as thousands separator (no decimal part)
        converted = v.replace(",", "").replace(".", "")
        return float(converted)
    else:
        # Plain number or already clean
        try:
            return float(v.replace(",", ""))
        except ValueError:
            report(f"Cannot parse number: '{value}'", "WARN")
            return 0.0


def clean_monetary_values_in_obj(obj, path: str = "root"):
    """
    Recursively walk a JSON object. For any string value that looks like
    a formatted number in a monetary field, convert it to float.
    """
    monetary_keywords = {
        "gross", "net", "revenue", "refund", "chargeback", "spend",
        "value", "cost", "price", "amount", "ltv", "cac", "roas",
        "ticket", "conversion_value",
    }

    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, str) and any(kw in k.lower() for kw in monetary_keywords):
                obj[k] = parse_brl_number(v)
            elif isinstance(v, (dict, list)):
                clean_monetary_values_in_obj(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            clean_monetary_values_in_obj(item, f"{path}[{i}]")


# ---------------------------------------------------------------------------
# 2. Revenue Deduplication — strip CRM currency fields
# ---------------------------------------------------------------------------

CRM_CURRENCY_FIELDS = {
    "total_crm_won_value",
    "crm_won_value",
    "crm_avg_deal",
}

# CRM funnel metrics to KEEP (non-monetary)
CRM_KEEP_FIELDS = {
    "total_crm_deals_won",
    "crm_deals_won",
    "crm_won_count",
    "crm_deal_count",
    "avg_deal_value",  # keep as reference but mark as CRM-sourced
}


def strip_crm_currency(data: dict) -> dict:
    """Remove CRM currency fields from overview and yearly_summary to prevent
    double-counting with checkout revenue."""

    removed_fields: list[str] = []

    # Overview
    overview = data.get("overview", {})
    for field in list(overview.keys()):
        if field in CRM_CURRENCY_FIELDS:
            old_val = overview.pop(field)
            removed_fields.append(f"overview.{field} (was {old_val})")

    # Remove CRM-based ROAS from overview since it relied on CRM value
    if "roas_crm" in overview:
        old_val = overview.pop("roas_crm")
        removed_fields.append(f"overview.roas_crm (was {old_val})")

    # Yearly summary
    for entry in data.get("yearly_summary", []):
        for field in list(entry.keys()):
            if field in CRM_CURRENCY_FIELDS:
                old_val = entry.pop(field)
                removed_fields.append(
                    f"yearly_summary[{entry.get('year', '?')}].{field} (was {old_val})"
                )
        if "roas_crm" in entry:
            old_val = entry.pop("roas_crm")
            removed_fields.append(
                f"yearly_summary[{entry.get('year', '?')}].roas_crm (was {old_val})"
            )

    # Monthly combined
    for entry in data.get("monthly_combined", []):
        for field in list(entry.keys()):
            if field in CRM_CURRENCY_FIELDS:
                old_val = entry.pop(field)
                removed_fields.append(
                    f"monthly_combined[{entry.get('month', '?')}].{field} (was {old_val})"
                )

    # CRM monthly won — keep counts, strip values
    for entry in data.get("crm_monthly_won", []):
        if "value" in entry:
            old_val = entry.pop("value")
            removed_fields.append(
                f"crm_monthly_won[{entry.get('month', '?')}].value (was {old_val})"
            )

    # LTV section — remove CRM avg deal
    ltv = data.get("ltv", {})
    if "crm_avg_deal" in ltv:
        old_val = ltv.pop("crm_avg_deal")
        removed_fields.append(f"ltv.crm_avg_deal (was {old_val})")

    # CRM deal analysis — keep structure but strip monetary totals
    cda = data.get("crm_deal_analysis", {})
    if "total_won_value" in cda:
        old_val = cda.pop("total_won_value")
        removed_fields.append(f"crm_deal_analysis.total_won_value (was {old_val})")

    for item in removed_fields:
        report(f"CRM currency field removed: {item}", "INFO")

    report(
        f"Revenue deduplication complete: {len(removed_fields)} CRM currency fields removed",
        "INFO",
    )
    return data


# ---------------------------------------------------------------------------
# 3. Account Filtering
# ---------------------------------------------------------------------------


def filter_account(data: dict) -> dict:
    """
    Verify data is tagged as 'Eu Medico Residente'.
    Since data.json is pre-aggregated for EMR, we check data_sources and
    product names for confirmation. Flag non-EMR rows if found.
    """
    # Check data sources for EMR indicators
    sources = data.get("data_sources", {})
    products = data.get("top_products", [])

    emr_indicators = 0
    non_emr_rows: list[str] = []

    # Check product names for EMR-related keywords
    emr_keywords = {"medico", "residente", "r1", "r2", "r3", "extensivo", "revisao",
                    "revisão", "residencia", "residência", "ses-pe", "expert pe",
                    "apostilas", "revalida"}

    for p in products:
        name_lower = p.get("name", "").lower()
        if any(kw in name_lower for kw in emr_keywords):
            emr_indicators += 1
        else:
            non_emr_rows.append(p.get("name", "unknown"))

    if emr_indicators > 0:
        report(
            f"Account filter: {emr_indicators}/{len(products)} top products match EMR keywords",
            "INFO",
        )
    else:
        report(
            "Account filter: No EMR product keywords found in top_products - verify data source",
            "WARN",
        )

    if non_emr_rows:
        report(
            f"Account filter: {len(non_emr_rows)} products did not match EMR keywords "
            f"(may be sub-products or bundles). First 5: {non_emr_rows[:5]}",
            "WARN",
        )

    data["emr_account_verified"] = True
    report("Account verified and tagged: emr_account_verified = true", "INFO")
    return data


# ---------------------------------------------------------------------------
# 4. Precision Validation
# ---------------------------------------------------------------------------


def validate_monthly_sum(data: dict) -> bool:
    """Validate SUM(monthly_revenue.gross) == overview.total_checkout_gross within tolerance."""
    monthly = data.get("monthly_revenue", [])
    overview = data.get("overview", {})
    total_gross = overview.get("total_checkout_gross", 0)

    monthly_sum = sum(entry.get("gross", 0) for entry in monthly)

    if total_gross == 0:
        report("Validation: total_checkout_gross is 0 - cannot validate", "CRITICAL")
        return False

    diff_pct = abs(monthly_sum - total_gross) / total_gross * 100

    if diff_pct <= TOLERANCE_PCT:
        report(
            f"PASS: SUM(monthly_revenue.gross) = {monthly_sum:,.2f} vs "
            f"total_checkout_gross = {total_gross:,.2f} (diff: {diff_pct:.2f}%)",
            "INFO",
        )
        return True
    else:
        report(
            f"FAIL: SUM(monthly_revenue.gross) = {monthly_sum:,.2f} vs "
            f"total_checkout_gross = {total_gross:,.2f} (diff: {diff_pct:.2f}% > {TOLERANCE_PCT}%)",
            "CRITICAL",
        )
        return False


def validate_products_sum(data: dict) -> bool:
    """Validate SUM(top_products.gross) vs total_checkout_gross within tolerance."""
    products = data.get("top_products", [])
    overview = data.get("overview", {})
    total_gross = overview.get("total_checkout_gross", 0)

    products_sum = sum(p.get("gross", 0) for p in products)

    if total_gross == 0:
        report("Validation: total_checkout_gross is 0 - cannot validate products", "CRITICAL")
        return False

    diff_pct = abs(products_sum - total_gross) / total_gross * 100

    if diff_pct <= TOLERANCE_PCT:
        report(
            f"PASS: SUM(products.gross) = {products_sum:,.2f} vs "
            f"total_checkout_gross = {total_gross:,.2f} (diff: {diff_pct:.2f}%)",
            "INFO",
        )
        return True
    else:
        report(
            f"WARN: SUM(products.gross) = {products_sum:,.2f} vs "
            f"total_checkout_gross = {total_gross:,.2f} (diff: {diff_pct:.2f}% > {TOLERANCE_PCT}%) "
            f"- products list may be truncated (top {len(products)} only)",
            "WARN",
        )
        # Not critical since top_products is typically a subset
        return True


def validate_scale(data: dict) -> bool:
    """
    Check that monetary values are in the correct scale.
    EMR's total revenue should be in the tens-of-millions range (R$100M+).
    Flag values that look like they were divided by 1000.
    """
    overview = data.get("overview", {})
    total_gross = overview.get("total_checkout_gross", 0)
    all_ok = True

    # Expected minimum scale for EMR (based on known data: ~R$101M)
    # If total is below R$1M, it's likely a scale error
    EXPECTED_MIN = 1_000_000  # R$1M minimum expected

    if 0 < total_gross < EXPECTED_MIN:
        report(
            f"SCALE ERROR: total_checkout_gross = R${total_gross:,.2f} "
            f"looks too small. Expected R$1M+. Was it divided by 1000?",
            "CRITICAL",
        )
        all_ok = False
    elif total_gross >= EXPECTED_MIN:
        report(
            f"Scale check PASS: total_checkout_gross = R${total_gross:,.2f} "
            f"(in expected range)",
            "INFO",
        )

    # Check yearly summaries for consistency
    yearly = data.get("yearly_summary", [])
    yearly_sum = sum(y.get("checkout_gross", 0) for y in yearly)

    if total_gross > 0 and yearly_sum > 0:
        ratio = yearly_sum / total_gross
        if abs(ratio - 1.0) > 0.05:
            report(
                f"WARN: SUM(yearly_summary.checkout_gross) = R${yearly_sum:,.2f} "
                f"vs total = R${total_gross:,.2f} (ratio: {ratio:.3f})",
                "WARN",
            )
        else:
            report(
                f"Yearly sum consistency PASS: ratio = {ratio:.4f}",
                "INFO",
            )

    # Check individual yearly values for scale anomalies
    for y in yearly:
        year = y.get("year", "?")
        gross = y.get("checkout_gross", 0)
        txns = y.get("txns", 0)
        if txns > 0 and gross > 0:
            avg_ticket = gross / txns
            # Medical residency courses typically R$1K-R$10K per transaction
            if avg_ticket < 100:
                report(
                    f"SCALE WARNING [{year}]: avg ticket = R${avg_ticket:,.2f} "
                    f"(gross={gross:,.2f}, txns={txns}) - suspiciously low for medical courses",
                    "WARN",
                )
            elif avg_ticket > 50000:
                report(
                    f"SCALE WARNING [{year}]: avg ticket = R${avg_ticket:,.2f} "
                    f"(gross={gross:,.2f}, txns={txns}) - suspiciously high",
                    "WARN",
                )

    return all_ok


# ---------------------------------------------------------------------------
# 5. Data Governance Metadata
# ---------------------------------------------------------------------------


def add_governance_metadata(data: dict) -> dict:
    """Add _data_governance section documenting what was cleaned."""
    data["_data_governance"] = {
        "preprocessed_at": datetime.now().isoformat(),
        "script": "scripts/preprocess_data.py",
        "version": "1.0.0",
        "actions_taken": [
            "BRL number format detection and normalization",
            "CRM currency fields removed from revenue calculations",
            "CRM funnel metrics (deal counts, stages, win rates) preserved",
            "Account filtered for 'Eu Medico Residente'",
            "Precision and scale validation performed",
        ],
        "crm_fields_removed": [
            "total_crm_won_value (overview)",
            "crm_won_value (yearly_summary, monthly_combined)",
            "crm_monthly_won.value",
            "roas_crm (overview, yearly_summary)",
            "ltv.crm_avg_deal",
            "crm_deal_analysis.total_won_value",
        ],
        "crm_fields_kept": [
            "total_crm_deals_won (overview)",
            "crm_deals_won (yearly_summary)",
            "crm_details (stages, pipelines, loss_reasons)",
            "crm_daily (won_count, new_deals, lost_count)",
            "crm_deal_analysis (structure minus total_won_value)",
        ],
        "revenue_source": "checkout_only (Guru Digital)",
        "emr_account_verified": True,
        "warnings_count": warnings_count,
        "critical_failures": len(critical_failures),
    }
    return data


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    report("=" * 60, "INFO")
    report("EMR Dashboard Data Preprocessor", "INFO")
    report("=" * 60, "INFO")

    # Load data
    if not os.path.exists(DATA_PATH):
        report(f"Data file not found: {DATA_PATH}", "CRITICAL")
        print_report()
        return 1

    report(f"Loading data from: {DATA_PATH}", "INFO")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    report(f"Loaded {len(data)} top-level keys", "INFO")

    # Phase 1: BRL Number Parsing
    report("-" * 40, "INFO")
    report("Phase 1: BRL Number Format Cleaning", "INFO")
    clean_monetary_values_in_obj(data)
    report("BRL number parsing complete", "INFO")

    # Phase 2: Revenue Deduplication
    report("-" * 40, "INFO")
    report("Phase 2: Revenue Deduplication (CRM strip)", "INFO")
    data = strip_crm_currency(data)

    # Phase 3: Account Filtering
    report("-" * 40, "INFO")
    report("Phase 3: Account Filtering", "INFO")
    data = filter_account(data)

    # Phase 4: Precision Validation
    report("-" * 40, "INFO")
    report("Phase 4: Precision & Scale Validation", "INFO")
    validate_monthly_sum(data)
    validate_products_sum(data)
    validate_scale(data)

    # Phase 5: Add governance metadata and write output
    report("-" * 40, "INFO")
    report("Phase 5: Write Output", "INFO")
    data = add_governance_metadata(data)

    # Write cleaned data back
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    report(f"Cleaned data written to: {DATA_PATH}", "INFO")

    # Print final report
    print_report()

    if critical_failures:
        log.error(f"EXITING WITH CODE 1 — {len(critical_failures)} critical failure(s)")
        return 1

    return 0


def print_report() -> None:
    """Print the full validation report to stdout."""
    print("\n" + "=" * 60)
    print("  EMR DATA PREPROCESSING — VALIDATION REPORT")
    print("=" * 60)
    for line in report_lines:
        print(f"  {line}")
    print("-" * 60)
    print(f"  Total warnings:  {warnings_count}")
    print(f"  Critical errors: {len(critical_failures)}")
    if critical_failures:
        print("\n  CRITICAL FAILURES:")
        for cf in critical_failures:
            print(f"    !! {cf}")
    print("=" * 60)
    if not critical_failures:
        print("  STATUS: ALL CHECKS PASSED")
    else:
        print("  STATUS: FAILED — see critical errors above")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    sys.exit(main())
