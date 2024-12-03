const bcrypt = require('bcryptjs');
const connection = require('../config/db');

// Fungsi untuk registrasi
exports.register = (req, res) => {
  const { username, password } = req.body;

  // Hash password menggunakan bcrypt
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password' });
    }

    // Simpan data pengguna ke database
    connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving user' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

// Fungsi untuk login
exports.login = (req, res) => {
  const { username, password } = req.body;

  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user data' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];

    // Cek password yang dimasukkan dengan password yang ada di database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing password' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }

      // Login berhasil, set session atau token
      req.session.user = user;
      res.status(200).json({ message: 'Login successful' });
    });
  });
};

// Fungsi untuk memeriksa apakah pengguna sudah login
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next(); // User sudah login, lanjutkan ke halaman yang diminta
  } else {
    res.status(401).json({ message: 'Unauthorized' }); // Jika belum login
  }
};
