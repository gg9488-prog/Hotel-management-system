// config/db.js — MySQL connection pool
// Load .env file if present (install dotenv: npm i dotenv)
try { require('dotenv').config(); } catch(e) {}

const mysql = require('mysql2');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '8688',
  database: process.env.DB_NAME     || 'restaurant_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Test connectivity on startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌  MySQL connection failed:', err.message);
    console.error('    Check your credentials in backend/.env or backend/config/db.js');
  } else {
    console.log('✅  MySQL connected successfully');
    conn.release();
  }
});

// Export promise-based pool
module.exports = pool.promise();
