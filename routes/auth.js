// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET signup form
router.get('/signup', authController.signup_get);

// POST signup form
router.post('/signup', authController.signup_post);

module.exports = router;
