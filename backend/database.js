const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:0615@localhost:5432/studyroom',
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

async function getAll(query, params) {
  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  getAll
}; 