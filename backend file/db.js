const { Pool } = require('pg');
require('dotenv').config();

// Most managed Postgres providers (Render, Railway, Supabase) require SSL
// in production but not for local development, so this is configurable.
const useSSL = process.env.PGSSL === 'true' || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
