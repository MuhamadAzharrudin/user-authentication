// config/db.js
const mysql = require('mysql');
require('dotenv').config();
// Koneksi ke database MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  // port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {  // Gantilah 'connection' menjadi 'db'
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;  // Pastikan Anda mengekspor db
