require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { runQuery, ping } = require('./lib/bigquery');
const Q = require('./lib/queries');

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'OPTIONS'],
  })
);

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---------------------------------------------------------------------------
// Helper — wrap async route handlers so errors become JSON responses
// ---------------------------------------------------------------------------

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(`[ERROR] ${req.url}:`, err.message);
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 500,
      });
    });
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// ── Health check ────────────────────────────────────────────────────────────

app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    let bigqueryOk = false;
    let bigqueryError = null;

    try {
      bigqueryOk = await ping();
    } catch (err) {
      bigqueryError = err.message;
    }

    // Grab table freshness for a quick "last sync" overview
    let tables = [];
    try {
      tables = await runQuery(Q.TABLE_METADATA);
    } catch (_) {
      // non-critical — return what we have
    }

    const syncTimes = {};
    for (const t of tables) {
      syncTimes[t.table_name] = t.last_modified?.value ?? t.last_modified ?? null;
    }

    res.json({
      status: bigqueryOk ? 'healthy' : 'degraded',
      bigquery: bigqueryOk ? 'connected' : bigqueryError,
      syncTimes,
      timestamp: new Date().toISOString(),
    });
  })
);

// ── Revenue validation ──────────────────────────────────────────────────────

app.get(
  '/api/revenue/validate',
  asyncHandler(async (req, res) => {
    const rows = await runQuery(Q.REVENUE_VALIDATION);
    const { total_guru_revenue, row_count } = rows[0] || {};

    // The caller can optionally pass ?expected=123456.78 to compare
    const expected = req.query.expected ? parseFloat(req.query.expected) : null;
    let match = null;
    if (expected !== null) {
      const diff = Math.abs(total_guru_revenue - expected);
      match = diff < 0.01 ? 'exact' : diff / expected < 0.001 ? 'close' : 'mismatch';
    }

    res.json({
      total_guru_revenue,
      row_count,
      expected,
      match,
      timestamp: new Date().toISOString(),
    });
  })
);

// ── Attribution ─────────────────────────────────────────────────────────────

app.get(
  '/api/attribution',
  asyncHandler(async (_req, res) => {
    const [firstTouch, lastTouch] = await Promise.all([
      runQuery(Q.FIRST_TOUCH_ATTRIBUTION),
      runQuery(Q.LAST_TOUCH_ATTRIBUTION),
    ]);

    res.json({
      firstTouch,
      lastTouch,
      timestamp: new Date().toISOString(),
    });
  })
);

// ── MRR & Churn ─────────────────────────────────────────────────────────────

app.get(
  '/api/mrr',
  asyncHandler(async (_req, res) => {
    const [mrr, churn] = await Promise.all([
      runQuery(Q.MRR_MONTHLY),
      runQuery(Q.CHURN_MONTHLY),
    ]);

    res.json({
      mrr,
      churn,
      timestamp: new Date().toISOString(),
    });
  })
);

// ── Cohort analysis ─────────────────────────────────────────────────────────

app.get(
  '/api/cohort',
  asyncHandler(async (_req, res) => {
    const rows = await runQuery(Q.COHORT_ANALYSIS);
    res.json({
      cohorts: rows,
      timestamp: new Date().toISOString(),
    });
  })
);

// ── Guru x CRM Join (deduplication) ──────────────────────────────────────────

app.get(
  '/api/guru-crm-join',
  asyncHandler(async (_req, res) => {
    const rows = await runQuery(Q.GURU_CRM_JOIN);
    res.json({
      records: rows,
      total: rows.length,
      timestamp: new Date().toISOString(),
    });
  })
);

// ── Match rate between Guru and CRM ──────────────────────────────────────────

app.get(
  '/api/match-rate',
  asyncHandler(async (_req, res) => {
    const rows = await runQuery(Q.MATCH_RATE);
    const data = rows[0] || {};
    res.json({
      guru_total: data.guru_total,
      crm_total: data.crm_total,
      matched: data.matched,
      guru_only: data.guru_only,
      crm_only: data.crm_only,
      match_rate_pct: data.guru_total > 0 ? ((data.matched / data.guru_total) * 100).toFixed(2) : 0,
      timestamp: new Date().toISOString(),
    });
  })
);

// ── Sync status (table metadata) ────────────────────────────────────────────

app.get(
  '/api/sync-status',
  asyncHandler(async (_req, res) => {
    const tables = await runQuery(Q.TABLE_METADATA);
    res.json({
      tables,
      timestamp: new Date().toISOString(),
    });
  })
);

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 404 });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`[EMR API] Listening on http://localhost:${PORT}`);
  console.log(`[EMR API] CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`[EMR API] BQ project:  ${process.env.BIGQUERY_PROJECT_ID || 'datawarehouse-emr'}`);
});
