// db.js — MySQL connection pool
// A "pool" reuses database connections instead of opening a new one for every request.
// This is much faster and more efficient.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shopsmart',
  waitForConnections: true,
  connectionLimit: 10,       // Maximum 10 simultaneous database connections
  queueLimit: 0
});

// Test the connection when the server starts
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL database connected successfully');
    conn.release(); // Always release connections back to the pool
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('Check your .env file and make sure MySQL is running');
  });

module.exports = pool;
