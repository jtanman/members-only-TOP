// controllers/authController.js

exports.signup_get = (req, res) => {
  res.render('signup');
};


const bcrypt = require('bcrypt');
const pool = require('../db');
require('dotenv').config();

exports.signup_post = async (req, res) => {
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
};
