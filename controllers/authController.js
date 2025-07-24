const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const pool = require('../db');
require('dotenv').config();

// Login GET
exports.login_get = (req, res) => {
  res.render('login');
};

// Login POST (with Passport)
const passport = require('passport');
exports.login_post = [
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        return res.status(401).send({ errors: [{ msg: info && info.message ? info.message : 'Invalid username or password.' }] });
      }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        return res.redirect('/');
      });
    })(req, res, next);
  }
];

// Join the club GET
exports.join_get = (req, res) => {
  res.render('join', { user: req.user });
};

// Signup GET
exports.signup_get = (req, res) => {
  res.render('signup');
};

// Join the club POST
exports.join_post = [
  body('clubPasscode').notEmpty().withMessage('Club passcode is required.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { clubPasscode } = req.body;
    // Use the logged-in user from the session
    if (!req.user) {
      return res.status(401).send({ errors: [{ msg: 'You must be logged in to join the club.' }] });
    }
    const username = req.user.username;

    if (process.env.CLUB_PASSCODE && clubPasscode === process.env.CLUB_PASSCODE) {
      try {
        await pool.query(
          `UPDATE users SET status = 'member' WHERE username = $1`,
          [username]
        );
        res.send('Membership status updated to member!');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error updating membership status.');
      }
    } else {
      res.status(401).send({ errors: [{ msg: 'Incorrect club passcode.' }] });
    }
  }
];

exports.signup_post = [
  // Validation and sanitization middleware
  body('firstName').trim().notEmpty().withMessage('First name is required.').isAlpha().withMessage('First name must contain only letters.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.').isAlpha().withMessage('Last name must contain only letters.'),
  body('username').trim().notEmpty().withMessage('Username is required.').isAlphanumeric().withMessage('Username must be alphanumeric.'),
  body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required.')
    .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.'),
  body('adminPasscode').optional().trim().escape(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return errors to the user (could render signup with errors)
      return res.status(400).send({ errors: errors.array() });
    }

    const { firstName, lastName, username, password, adminPasscode } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      let status = 'user';
      if (adminPasscode && process.env.ADMIN_PW && adminPasscode === process.env.ADMIN_PW) {
        status = 'admin';
      }
      const result = await pool.query(
        `INSERT INTO users (username, first_name, last_name, password, status, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
        [username, firstName, lastName, hashedPassword, status]
      );
      res.send(`User ${firstName} ${lastName} (${username}) signed up! Status: ${status}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error signing up.');
    }
  }
];
