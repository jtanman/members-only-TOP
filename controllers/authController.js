// controllers/authController.js


const { body, validationResult } = require('express-validator');

exports.signup_get = (req, res) => {
  res.render('signup');
};


const bcrypt = require('bcrypt');
const pool = require('../db');
require('dotenv').config();

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
