// seed.js — Database initialization and seeding script
// Run with: node seed.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSeed() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'shopsmart';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Connect without database first in case it doesn't exist
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });
    console.log('Connected to MySQL server.');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.query(`USE \`${database}\`;`);
    console.log(`Using database "${database}".`);

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema file
    console.log('Executing schema.sql...');
    await connection.query(sql);

    console.log('Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('  Admin:    admin@shopsmart.com / admin123');
    console.log('  Customer: john@example.com    / customer123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Tip: Check your DB_PASSWORD in server/.env');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeed();
