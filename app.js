require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Cek koneksi database
db.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke database:', err.stack);
    process.exit(1);
  }
  console.log('Terhubung ke database');
});

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Pastikan views directory terdefinisi dengan benar

// Setup express-session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Ganti dengan string rahasia
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Jika menggunakan HTTPS, set secure: true
}));

// Middleware untuk mengecek apakah user sudah login
function isLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  } else {
    return res.redirect('/login');
  }
}

// Rute untuk halaman utama (root) yang mengarahkan ke login
app.get('/', (req, res) => {
  res.redirect('/login');
});


// Rute Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.send('Terjadi kesalahan pada server');
    }

    if (results.length === 0) {
      return res.send('Pengguna tidak ditemukan');
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.send('Terjadi kesalahan pada server');
      }

      if (isMatch) {
        req.session.loggedIn = true;  // Menyimpan status login pengguna
        req.session.username = username; // Menyimpan username pengguna
        res.redirect('/home'); // Arahkan ke halaman home setelah login berhasil
      } else {
        res.send('Password salah');
      }
    });
  });
});

// Rute Registrasi
app.get('/register', (req, res) => {
  res.render('register');
});

app.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('register', { errors: errors.array() });
    }

    const { username, password } = req.body;
    bcrypt.hash(password, 8, (err, hashedPassword) => {
      if (err) {
        console.error('Error saat hashing password:', err);
        return res.send('Kesalahan pada server');
      }

      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
          console.error(err);
          return res.send('Terjadi kesalahan saat mendaftar');
        }
        res.redirect('/login');
      });
    });
  }
);

// Rute Halaman Utama dan Halaman Lain yang membutuhkan login
app.get('/home', isLoggedIn, (req, res) => {
  res.render('home');
});

app.get('/courses', isLoggedIn, (req, res) => {
  res.render('courses');
});

app.get('/about', isLoggedIn, (req, res) => {
  res.render('about');
});

app.get('/contact', isLoggedIn, (req, res) => {
  res.render('contact');
});

app.get('/courses/oxford', isLoggedIn, (req, res) => {
  res.render('oxford');
});

app.get('/courses/harvard', isLoggedIn, (req, res) => {
  res.render('harvard');
});

app.get('/courses/mit', isLoggedIn, (req, res) => {
  res.render('mit');
});

// Rute Error 404 jika halaman tidak ditemukan
app.use((req, res) => {
  res.status(404).render('404', { error: 'Halaman tidak ditemukan' }); // Halaman error 404 khusus
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
