const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db');

// GET message creation form
router.get('/message/new', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  res.render('message_form');
});

// POST new message
router.post('/message/new', [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('body').trim().notEmpty().withMessage('Body is required.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      await pool.query(
        'INSERT INTO messages (title, text, user_id, created_at) VALUES ($1, $2, $3, NOW())',
        [req.body.title, req.body.body, req.user.id]
      );
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error creating message.');
    }
  }
]);

module.exports = router;
