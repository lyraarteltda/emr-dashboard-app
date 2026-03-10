# BigQuery API — EMR Dashboard

Complete reference for accessing BigQuery data in the EMR Dashboard project.

---

## Connection Details

| Field | Value |
|-------|-------|
| **Project ID** | `datawarehouse-emr` |
| **Dataset** | `rdstation_mkt` |
| **Service Account Key** | `datawarehouse-emr-46c96c1155ed.json` |
| **Key Location (Arthur)** | `/Users/arthurendo/Downloads/datawarehouse-emr-46c96c1155ed.json` |
| **Dev (Waghner)** | Generated and delivered the key file |
| **API Region** | US |

---

## Tables

| Table | Rows | Description | Key Fields |
|-------|------|-------------|------------|
| `eventos_conversoes` | ~299K | Email conversions + UTMs + Guru revenue | `email`, `data_conversao`, `guru_revenue`, `utm_source`, `utm_medium`, `utm_campaign` |
| `eventos_conversoes_traffic_source` | ~890K | Traffic source details per conversion | `email`, `traffic_source`, `traffic_medium`, `traffic_campaign` |
| `vRastreamentoConversoes` | ~88K | First-touch / current-touch attribution | `email`, `first_utm_source`, `first_utm_medium`, `first_utm_campaign`, `current_utm_source`, `current_utm_medium`, `current_utm_campaign`, `valor`, `data_conversao` |
| `base_churn_consolidada` | — | MRR, churn, adjusted billing | `cliente_id`, `data_referencia`, `faturamento_ajustado`, `churn` |

---

## Authentication Methods

### Python (google-cloud-bigquery)

```bash
pip install google-cloud-bigquery
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/datawarehouse-emr-46c96c1155ed.json
```

```python
from google.cloud import bigquery

client = bigquery.Client(project="datawarehouse-emr")
query = "SELECT * FROM `rdstation_mkt.eventos_conversoes` LIMIT 10"
rows = client.query(query).result()
for row in rows:
    print(dict(row))
```

### Node.js (@google-cloud/bigquery)

```bash
npm install @google-cloud/bigquery
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/datawarehouse-emr-46c96c1155ed.json
```

```javascript
const { BigQuery } = require('@google-cloud/bigquery');
const client = new BigQuery({ projectId: 'datawarehouse-emr' });

const [rows] = await client.query({
  query: 'SELECT * FROM `rdstation_mkt.eventos_conversoes` LIMIT 10',
  location: 'US',
});
console.log(rows);
```

### curl / REST API

```bash
# Step 1: Get OAuth token (requires gcloud CLI authenticated)
TOKEN=$(gcloud auth print-access-token)

# Step 2: List tables
curl -H "Authorization: Bearer $TOKEN" \
  "https://bigquery.googleapis.com/bigquery/v2/projects/datawarehouse-emr/datasets/rdstation_mkt/tables"

# Step 3: Run a query
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://bigquery.googleapis.com/bigquery/v2/projects/datawarehouse-emr/queries" \
  -d '{
    "query": "SELECT SUM(guru_revenue) AS total FROM `rdstation_mkt.eventos_conversoes`",
    "useLegacySql": false
  }'
```

### n8n (Workflow Automation)

1. BigQuery node -> credential type: **Service Account Key**
2. Paste the full JSON content of `datawarehouse-emr-46c96c1155ed.json`
3. Project ID: `datawarehouse-emr`
4. Default Dataset: `rdstation_mkt`

---

## EMR Dashboard API Endpoints

The backend API runs at `http://localhost:3001` (dev) and caches queries for 5 minutes.

### GET /api/health

Connection status + table freshness.

```bash
curl http://localhost:3001/api/health
```

```json
{
  "status": "healthy",
  "bigquery": "connected",
  "syncTimes": {
    "eventos_conversoes": "2026-03-10T...",
    "base_churn_consolidada": "2026-03-09T..."
  },
  "timestamp": "2026-03-10T..."
}
```

### GET /api/revenue/validate

Validates `SUM(guru_revenue)` against dashboard. Optional `?expected=101920676.39`.

```bash
curl "http://localhost:3001/api/revenue/validate?expected=101920676.39"
```

```json
{
  "total_guru_revenue": 101920676.39,
  "row_count": 299000,
  "expected": 101920676.39,
  "match": "exact",
  "timestamp": "..."
}
```

### GET /api/attribution

First-touch and last-touch attribution models from `vRastreamentoConversoes`.

```bash
curl http://localhost:3001/api/attribution
```

```json
{
  "firstTouch": [
    { "utm_source": "facebook", "utm_medium": "cpc", "utm_campaign": "kv-broad", "conversions": 5200, "revenue": 1200000 }
  ],
  "lastTouch": [
    { "utm_source": "google", "utm_medium": "organic", "utm_campaign": null, "conversions": 3100, "revenue": 890000 }
  ],
  "timestamp": "..."
}
```

### GET /api/mrr

Monthly Recurring Revenue + Churn from `base_churn_consolidada`.

```bash
curl http://localhost:3001/api/mrr
```

```json
{
  "mrr": [
    { "month": "2025-01", "mrr": 450000, "active_customers": 1200 }
  ],
  "churn": [
    { "month": "2025-01", "total_customers": 1200, "churned": 45, "churn_rate": 0.0375 }
  ],
  "timestamp": "..."
}
```

### GET /api/cohort

Monthly cohort analysis: lead acquisition month -> transaction months.

```bash
curl http://localhost:3001/api/cohort
```

```json
{
  "cohorts": [
    { "cohort_month": "2023-01", "txn_month": "2023-01", "customers": 150, "revenue": 320000 },
    { "cohort_month": "2023-01", "txn_month": "2023-02", "customers": 45, "revenue": 98000 }
  ],
  "timestamp": "..."
}
```

### GET /api/guru-crm-join

Deduplicated 1-to-1 join: Guru transactions (revenue) + CRM leads (attribution) via email.

```bash
curl http://localhost:3001/api/guru-crm-join
```

```json
{
  "records": [
    {
      "email": "user@example.com",
      "total_revenue": 15000,
      "total_transactions": 12,
      "first_purchase": "2022-05-10",
      "last_purchase": "2025-11-20",
      "first_utm_source": "facebook",
      "first_utm_medium": "cpc",
      "first_utm_campaign": "kv-broad",
      "current_utm_source": "google",
      "current_utm_medium": "organic",
      "match_status": "matched"
    }
  ],
  "total": 10000,
  "timestamp": "..."
}
```

### GET /api/match-rate

Coverage statistics between Guru (revenue) and CRM (leads).

```bash
curl http://localhost:3001/api/match-rate
```

```json
{
  "guru_total": 25000,
  "crm_total": 88000,
  "matched": 18000,
  "guru_only": 7000,
  "crm_only": 70000,
  "match_rate_pct": "72.00",
  "timestamp": "..."
}
```

### GET /api/sync-status

Row counts and last modified date per table.

```bash
curl http://localhost:3001/api/sync-status
```

```json
{
  "tables": [
    { "table_name": "eventos_conversoes", "row_count": 299000, "last_modified": "2026-03-10T..." },
    { "table_name": "eventos_conversoes_traffic_source", "row_count": 890000, "last_modified": "2026-03-10T..." },
    { "table_name": "vRastreamentoConversoes", "row_count": 88000, "last_modified": "2026-03-09T..." },
    { "table_name": "base_churn_consolidada", "row_count": 50000, "last_modified": "2026-03-08T..." }
  ],
  "timestamp": "..."
}
```

---

## SQL Query Reference

### Revenue Validation (Guru = single source of truth)

```sql
SELECT
  SUM(guru_revenue) AS total_guru_revenue,
  COUNT(*)          AS row_count
FROM `rdstation_mkt.eventos_conversoes`
```

### First-Touch Attribution

```sql
SELECT
  first_utm_source   AS utm_source,
  first_utm_medium   AS utm_medium,
  first_utm_campaign AS utm_campaign,
  COUNT(*)           AS conversions,
  SUM(valor)         AS revenue
FROM `rdstation_mkt.vRastreamentoConversoes`
GROUP BY 1, 2, 3
ORDER BY conversions DESC
LIMIT 200
```

### Last-Touch Attribution

```sql
SELECT
  last_utm_source    AS utm_source,
  last_utm_medium    AS utm_medium,
  last_utm_campaign  AS utm_campaign,
  COUNT(*)           AS conversions,
  SUM(valor)         AS revenue
FROM `rdstation_mkt.vRastreamentoConversoes`
GROUP BY 1, 2, 3
ORDER BY conversions DESC
LIMIT 200
```

### Monthly Recurring Revenue

```sql
SELECT
  FORMAT_TIMESTAMP('%Y-%m', data_referencia) AS month,
  SUM(faturamento_ajustado)                  AS mrr,
  COUNT(DISTINCT cliente_id)                 AS active_customers
FROM `rdstation_mkt.base_churn_consolidada`
GROUP BY 1
ORDER BY 1
```

### Monthly Churn Rate

```sql
WITH months AS (
  SELECT
    FORMAT_TIMESTAMP('%Y-%m', data_referencia) AS month,
    COUNT(DISTINCT cliente_id)                 AS total_customers,
    COUNT(DISTINCT CASE WHEN churn = TRUE THEN cliente_id END) AS churned
  FROM `rdstation_mkt.base_churn_consolidada`
  GROUP BY 1
)
SELECT
  month,
  total_customers,
  churned,
  SAFE_DIVIDE(churned, total_customers) AS churn_rate
FROM months
ORDER BY month
```

### Cohort Analysis (Lead -> Transaction)

```sql
WITH lead_cohorts AS (
  SELECT
    email,
    FORMAT_TIMESTAMP('%Y-%m', MIN(data_conversao)) AS cohort_month
  FROM `rdstation_mkt.eventos_conversoes`
  WHERE email IS NOT NULL
  GROUP BY email
),
transactions AS (
  SELECT
    email,
    FORMAT_TIMESTAMP('%Y-%m', data_conversao) AS txn_month,
    SUM(guru_revenue)                         AS revenue
  FROM `rdstation_mkt.eventos_conversoes`
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
```

### Guru x CRM Deduplication Join

```sql
WITH guru_txns AS (
  SELECT
    email,
    SUM(guru_revenue) AS total_revenue,
    COUNT(*) AS total_transactions,
    MIN(data_conversao) AS first_purchase,
    MAX(data_conversao) AS last_purchase
  FROM `rdstation_mkt.eventos_conversoes`
  WHERE guru_revenue > 0 AND email IS NOT NULL
  GROUP BY email
),
crm_leads AS (
  SELECT
    email,
    first_utm_source, first_utm_medium, first_utm_campaign,
    current_utm_source, current_utm_medium, current_utm_campaign,
    MIN(data_conversao) AS first_conversion
  FROM `rdstation_mkt.vRastreamentoConversoes`
  WHERE email IS NOT NULL
  GROUP BY email, first_utm_source, first_utm_medium, first_utm_campaign,
           current_utm_source, current_utm_medium, current_utm_campaign
)
SELECT
  g.email, g.total_revenue, g.total_transactions,
  g.first_purchase, g.last_purchase,
  c.first_utm_source, c.first_utm_medium, c.first_utm_campaign,
  c.current_utm_source, c.current_utm_medium, c.current_utm_campaign,
  c.first_conversion AS crm_first_touch,
  CASE WHEN c.email IS NOT NULL THEN 'matched' ELSE 'guru_only' END AS match_status
FROM guru_txns g
LEFT JOIN crm_leads c ON g.email = c.email
ORDER BY g.total_revenue DESC
```

### Match Rate (Guru vs CRM)

```sql
WITH guru_emails AS (
  SELECT DISTINCT email FROM `rdstation_mkt.eventos_conversoes`
  WHERE guru_revenue > 0 AND email IS NOT NULL
),
crm_emails AS (
  SELECT DISTINCT email FROM `rdstation_mkt.vRastreamentoConversoes`
  WHERE email IS NOT NULL
)
SELECT
  (SELECT COUNT(*) FROM guru_emails) AS guru_total,
  (SELECT COUNT(*) FROM crm_emails) AS crm_total,
  (SELECT COUNT(*) FROM guru_emails g JOIN crm_emails c ON g.email = c.email) AS matched,
  (SELECT COUNT(*) FROM guru_emails g LEFT JOIN crm_emails c ON g.email = c.email WHERE c.email IS NULL) AS guru_only,
  (SELECT COUNT(*) FROM crm_emails c LEFT JOIN guru_emails g ON g.email = c.email WHERE g.email IS NULL) AS crm_only
```

### Table Metadata (Row Counts + Freshness)

```sql
SELECT
  table_id                            AS table_name,
  row_count,
  TIMESTAMP_MILLIS(last_modified_time) AS last_modified
FROM `rdstation_mkt.__TABLES__`
ORDER BY table_id
```

---

## Quick Start (Local Dev)

```bash
# 1. Copy the service account key to this machine
scp arthur@machine:/Users/arthurendo/Downloads/datawarehouse-emr-46c96c1155ed.json ./

# 2. Setup environment
cd /Users/lyriazoccal/Downloads/emr-dashboard-app/api
cp .env.example .env
# Edit .env — set GOOGLE_APPLICATION_CREDENTIALS to the key path

# 3. Install and run
npm install
node server.js
# -> Listening on http://localhost:3001

# 4. Test
curl http://localhost:3001/api/health
curl http://localhost:3001/api/sync-status
curl "http://localhost:3001/api/revenue/validate?expected=101920676.39"
```

---

## Architecture Rules

1. **Guru Digital = ONLY revenue source.** Never sum CRM values into revenue totals.
2. **CRM = funnel/pipeline tracking only.** Deals won, stages, win rates — no financial data.
3. **BigQuery = Single Source of Truth.** All data joins happen in BQ, not in the frontend.
4. **Join key = email.** Guru transactions and CRM leads are linked via email address.
5. **Cache = 5 minutes.** All BQ queries are cached in-memory to avoid expensive scans.
6. **Validation before render.** `SUM(guru_revenue)` must equal dashboard total. Mismatch triggers a warning banner.

---

## Common Ad-hoc Queries

### Revenue by year

```sql
SELECT
  EXTRACT(YEAR FROM data_conversao) AS year,
  SUM(guru_revenue) AS revenue,
  COUNT(*) AS transactions
FROM `rdstation_mkt.eventos_conversoes`
WHERE guru_revenue > 0
GROUP BY 1
ORDER BY 1
```

### Top 20 customers by lifetime value

```sql
SELECT
  email,
  SUM(guru_revenue) AS ltv,
  COUNT(*) AS purchases,
  MIN(data_conversao) AS first_purchase,
  MAX(data_conversao) AS last_purchase
FROM `rdstation_mkt.eventos_conversoes`
WHERE guru_revenue > 0 AND email IS NOT NULL
GROUP BY email
ORDER BY ltv DESC
LIMIT 20
```

### Conversion funnel by UTM source

```sql
SELECT
  first_utm_source,
  COUNT(*) AS total_leads,
  COUNT(CASE WHEN guru_revenue > 0 THEN 1 END) AS buyers,
  SUM(guru_revenue) AS total_revenue,
  SAFE_DIVIDE(COUNT(CASE WHEN guru_revenue > 0 THEN 1 END), COUNT(*)) AS conversion_rate
FROM `rdstation_mkt.vRastreamentoConversoes`
GROUP BY 1
HAVING total_leads > 10
ORDER BY total_revenue DESC
```

### Monthly new leads vs conversions

```sql
SELECT
  FORMAT_TIMESTAMP('%Y-%m', data_conversao) AS month,
  COUNT(DISTINCT email) AS new_leads,
  COUNT(DISTINCT CASE WHEN guru_revenue > 0 THEN email END) AS converters,
  SUM(guru_revenue) AS revenue
FROM `rdstation_mkt.eventos_conversoes`
WHERE email IS NOT NULL
GROUP BY 1
ORDER BY 1
```

### Traffic source breakdown

```sql
SELECT
  traffic_source,
  traffic_medium,
  COUNT(*) AS events,
  COUNT(DISTINCT email) AS unique_users
FROM `rdstation_mkt.eventos_conversoes_traffic_source`
GROUP BY 1, 2
ORDER BY events DESC
LIMIT 50
```
