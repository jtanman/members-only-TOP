const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./db');
const bcrypt = require('bcrypt');

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: false }));

// Session middleware (in-memory store, not for production)
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Serve static files (optional, for CSS/images if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.title, m.text, m.created_at, u.username, u.status
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
    `);
    res.render('index', { user: req.user, messages: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading messages.');
  }
});


// Auth routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);


// Message routes
const messageRoutes = require('./routes/message');
app.use('/', messageRoutes);

// Logout route
const logoutRoutes = require('./routes/logout');
app.use('/', logoutRoutes);

// Admin message routes
const messageAdminRoutes = require('./routes/message_admin');
app.use('/', messageAdminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});