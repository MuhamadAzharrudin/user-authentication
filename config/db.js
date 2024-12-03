// config/db.js
const mysql = require('mysql');

// Koneksi ke database MySQL
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'admin',        
  password: 'admin123',         
  database: 'web_users' 
});

// Cek koneksi
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = connection;
