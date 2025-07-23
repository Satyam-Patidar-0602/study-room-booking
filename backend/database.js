const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:0615@localhost:5432/studyroom',
  // ssl: { rejectUnauthorized: false } // Uncomment for production with SSL
});

async function getAll(query, params) {
  const result = await pool.query(query, params);
  return result.rows;
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  getAll
}; 