import pg from 'pg';

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;

export const initPostgres = async () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URI;

  if (!connectionString) {
    return false;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('neon.tech') || connectionString.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
      max: 20, // Connection pool limit
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    const res = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log(`[Database] PostgreSQL Connected: ${res.rows[0].pg_version.split(' ')[0]} at ${res.rows[0].current_time}`);
    isPostgresConnected = true;
    return true;
  } catch (err) {
    console.warn(`[Database] PostgreSQL connection skipped (${err.message}).`);
    isPostgresConnected = false;
    return false;
  }
};

export const getPostgresPool = () => pool;
export const getIsPostgresConnected = () => isPostgresConnected;

// Parameterized Query Helper (Prevents SQL Injection)
export const query = async (text, params) => {
  if (!pool) throw new Error('PostgreSQL pool not initialized');
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // Log slow queries (> 100ms)
  if (duration > 100) {
    console.warn(`[SQL Slow Query] ${text} -> ${duration}ms (${res.rowCount} rows)`);
  }
  return res;
};

// Relational JOIN Demonstration Helper (Aligns with Roadmap 2026 slide)
export const getDecodesWithUserJoin = async (limit = 20) => {
  const sql = `
    SELECT 
      d.id,
      d.decoder_type,
      d.decoded_output,
      d.ai_summary,
      d.security_audit,
      d.complexity,
      d.is_bookmarked,
      d.created_at,
      u.name AS operator_name,
      u.email AS operator_email,
      u.role AS operator_role
    FROM decode_records d
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
    LIMIT $1;
  `;
  return await query(sql, [limit]);
};
