// ---------------------------------------------------------------------------
// Named SQL queries for the EMR Dashboard API
// All queries reference the dataset via the DATASET env var (default rdstation_mkt).
// ---------------------------------------------------------------------------

const DS = process.env.DATASET_ID || 'rdstation_mkt';

// ── Revenue validation ──────────────────────────────────────────────────────

const REVENUE_VALIDATION = `
  SELECT
    SUM(guru_revenue) AS total_guru_revenue,
    COUNT(*)          AS row_count
  FROM \`${DS}.eventos_conversoes\`
`;

// ── Attribution ─────────────────────────────────────────────────────────────

const FIRST_TOUCH_ATTRIBUTION = `
  SELECT
    first_utm_source   AS utm_source,
    first_utm_medium   AS utm_medium,
    first_utm_campaign  AS utm_campaign,
    COUNT(*)            AS conversions,
    SUM(valor)          AS revenue
  FROM \`${DS}.vRastreamentoConversoes\`
  GROUP BY 1, 2, 3
  ORDER BY conversions DESC
  LIMIT 200
`;

const LAST_TOUCH_ATTRIBUTION = `
  SELECT
    last_utm_source    AS utm_source,
    last_utm_medium    AS utm_medium,
    last_utm_campaign  AS utm_campaign,
    COUNT(*)           AS conversions,
    SUM(valor)         AS revenue
  FROM \`${DS}.vRastreamentoConversoes\`
  GROUP BY 1, 2, 3
  ORDER BY conversions DESC
  LIMIT 200
`;

// ── MRR & Churn ─────────────────────────────────────────────────────────────

const MRR_MONTHLY = `
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', data_referencia) AS month,
    SUM(faturamento_ajustado)                  AS mrr,
    COUNT(DISTINCT cliente_id)                 AS active_customers
  FROM \`${DS}.base_churn_consolidada\`
  GROUP BY 1
  ORDER BY 1
`;

const CHURN_MONTHLY = `
  WITH months AS (
    SELECT
      FORMAT_TIMESTAMP('%Y-%m', data_referencia) AS month,
      COUNT(DISTINCT cliente_id)                 AS total_customers,
      COUNT(DISTINCT CASE WHEN churn = TRUE THEN cliente_id END) AS churned
    FROM \`${DS}.base_churn_consolidada\`
    GROUP BY 1
  )
  SELECT
    month,
    total_customers,
    churned,
    SAFE_DIVIDE(churned, total_customers) AS churn_rate
  FROM months
  ORDER BY month
`;

// ── Table metadata ──────────────────────────────────────────────────────────

const TABLE_METADATA = `
  SELECT
    table_id                                          AS table_name,
    row_count,
    TIMESTAMP_MILLIS(last_modified_time)               AS last_modified
  FROM \`${DS}.__TABLES__\`
  ORDER BY table_id
`;

// ── Cohort analysis ─────────────────────────────────────────────────────────

const COHORT_ANALYSIS = `
  WITH lead_cohorts AS (
    SELECT
      email,
      FORMAT_TIMESTAMP('%Y-%m', MIN(data_conversao)) AS cohort_month
    FROM \`${DS}.eventos_conversoes\`
    WHERE email IS NOT NULL
    GROUP BY email
  ),
  transactions AS (
    SELECT
      email,
      FORMAT_TIMESTAMP('%Y-%m', data_conversao) AS txn_month,
      SUM(guru_revenue)                         AS revenue
    FROM \`${DS}.eventos_conversoes\`
    WHERE guru_revenue > 0
    GROUP BY email, 2
  )
  SELECT
    lc.cohort_month,
    t.txn_month,
    COUNT(DISTINCT t.email) AS customers,
    SUM(t.revenue)          AS revenue
  FROM lead_cohorts lc
  JOIN transactions t USING (email)
  GROUP BY 1, 2
  ORDER BY 1, 2
`;

// ── Guru x CRM Deduplication Join ─────────────────────────────────────────
// Joins Guru transactions (revenue source of truth) with CRM leads via email
// to ensure 1-to-1 relationship. CRM provides funnel stage, Guru provides $$$

const GURU_CRM_JOIN = `
  WITH guru_txns AS (
    SELECT
      email,
      SUM(guru_revenue) AS total_revenue,
      COUNT(*) AS total_transactions,
      MIN(data_conversao) AS first_purchase,
      MAX(data_conversao) AS last_purchase
    FROM \`${DS}.eventos_conversoes\`
    WHERE guru_revenue > 0 AND email IS NOT NULL
    GROUP BY email
  ),
  crm_leads AS (
    SELECT
      email,
      first_utm_source,
      first_utm_medium,
      first_utm_campaign,
      current_utm_source,
      current_utm_medium,
      current_utm_campaign,
      MIN(data_conversao) AS first_conversion
    FROM \`${DS}.vRastreamentoConversoes\`
    WHERE email IS NOT NULL
    GROUP BY email, first_utm_source, first_utm_medium, first_utm_campaign,
             current_utm_source, current_utm_medium, current_utm_campaign
  )
  SELECT
    g.email,
    g.total_revenue,
    g.total_transactions,
    g.first_purchase,
    g.last_purchase,
    c.first_utm_source,
    c.first_utm_medium,
    c.first_utm_campaign,
    c.current_utm_source,
    c.current_utm_medium,
    c.current_utm_campaign,
    c.first_conversion AS crm_first_touch,
    CASE WHEN c.email IS NOT NULL THEN 'matched' ELSE 'guru_only' END AS match_status
  FROM guru_txns g
  LEFT JOIN crm_leads c ON g.email = c.email
  ORDER BY g.total_revenue DESC
  LIMIT 10000
`;

// Match rate summary
const MATCH_RATE = `
  WITH guru_emails AS (
    SELECT DISTINCT email FROM \`${DS}.eventos_conversoes\`
    WHERE guru_revenue > 0 AND email IS NOT NULL
  ),
  crm_emails AS (
    SELECT DISTINCT email FROM \`${DS}.vRastreamentoConversoes\`
    WHERE email IS NOT NULL
  )
  SELECT
    (SELECT COUNT(*) FROM guru_emails) AS guru_total,
    (SELECT COUNT(*) FROM crm_emails) AS crm_total,
    (SELECT COUNT(*) FROM guru_emails g JOIN crm_emails c ON g.email = c.email) AS matched,
    (SELECT COUNT(*) FROM guru_emails g LEFT JOIN crm_emails c ON g.email = c.email WHERE c.email IS NULL) AS guru_only,
    (SELECT COUNT(*) FROM crm_emails c LEFT JOIN guru_emails g ON g.email = c.email WHERE g.email IS NULL) AS crm_only
`;

module.exports = {
  REVENUE_VALIDATION,
  FIRST_TOUCH_ATTRIBUTION,
  LAST_TOUCH_ATTRIBUTION,
  MRR_MONTHLY,
  CHURN_MONTHLY,
  TABLE_METADATA,
  COHORT_ANALYSIS,
  GURU_CRM_JOIN,
  MATCH_RATE,
};
