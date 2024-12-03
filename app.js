const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const app = express();

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'admin',  
  password: 'admin123',  
  database: 'web_users'
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
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
    if (bcrypt.compareSync(password, user.password)) {
      res.redirect('/home');
    } else {
      res.send('Password salah');
    }
  });
});


app.get('/register', (req, res) => {
  res.render('register');
});


app.post('/register', (req, res) => {
  const { username, password } = req.body;

 
  const hashedPassword = bcrypt.hashSync(password, 8);


  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, results) => {
    if (err) {
      console.error(err);
      return res.send('Terjadi kesalahan saat mendaftar');
    }
    res.redirect('/login');
  });
});

//rute set up hare got dammed
app.get('/home', (req, res) => {
  console.log("work");
  res.render('home');
});

app.get('/courses', (req, res) => {
  console.log("work");
  res.render('courses');
});
app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});


app.get('/courses/oxford', (req, res) => {
  console.log("work");
  res.render('oxford'); 
});

app.get('/courses/harvard', (req, res) => {
  console.log("work");
  res.render('harvard'); 
});

app.get('/courses/mit', (req, res) => {
  console.log("work");
  res.render('mit'); 
});


app.get('*', (req, res) => {
  res.status(404).send('Page Not Found');
});


app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000/login');
});


