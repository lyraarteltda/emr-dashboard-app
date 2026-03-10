const { BigQuery } = require('@google-cloud/bigquery');

// ---------------------------------------------------------------------------
// BigQuery client singleton with in-memory query cache (5-min TTL)
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let _client = null;

/**
 * Returns the shared BigQuery client instance (lazy-initialised).
 */
function getClient() {
  if (!_client) {
    _client = new BigQuery({
      projectId: process.env.BIGQUERY_PROJECT_ID || 'datawarehouse-emr',
      // GOOGLE_APPLICATION_CREDENTIALS env var is picked up automatically by
      // the client library — no need to pass keyFilename explicitly.
    });
  }
  return _client;
}

// Simple in-memory cache: key → { data, ts }
const _cache = new Map();

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}

/**
 * Build a stable cache key from the SQL text + params.
 */
function buildCacheKey(sql, params) {
  return `${sql}::${JSON.stringify(params ?? {})}`;
}

/**
 * Execute a BigQuery SQL query with optional named parameters.
 *
 * @param {string} sql       – The SQL string (use @param placeholders).
 * @param {object} [params]  – Named parameters ({ name: value }).
 * @param {object} [opts]    – Extra options: { skipCache: boolean }
 * @returns {Promise<object[]>} – Array of row objects.
 */
async function runQuery(sql, params = {}, opts = {}) {
  const key = buildCacheKey(sql, params);

  // Check cache first
  if (!opts.skipCache) {
    const cached = cacheGet(key);
    if (cached) {
      console.log(`[BQ] Cache HIT  (key hash ${key.slice(0, 40)}…)`);
      return cached;
    }
  }

  const client = getClient();
  const start = Date.now();

  try {
    const [rows] = await client.query({
      query: sql,
      params,
      location: 'US', // adjust if dataset is elsewhere
    });

    const elapsed = Date.now() - start;
    console.log(`[BQ] Query OK   ${elapsed}ms  rows=${rows.length}  sql=${sql.slice(0, 80)}…`);

    cacheSet(key, rows);
    return rows;
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[BQ] Query FAIL ${elapsed}ms  ${err.message}`);
    throw err;
  }
}

/**
 * Quick connectivity check — runs a trivial query.
 */
async function ping() {
  const client = getClient();
  const [rows] = await client.query({ query: 'SELECT 1 AS ok' });
  return rows.length === 1;
}

module.exports = { getClient, runQuery, ping };
