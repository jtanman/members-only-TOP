const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET login form
router.get('/login', authController.login_get);

// POST login form
router.post('/login', authController.login_post);
// routes/auth.js

// GET signup form
router.get('/signup', authController.signup_get);

// POST signup form
router.post('/signup', authController.signup_post);

// GET join club form
router.get('/join', authController.join_get);

// POST join club form
router.post('/join', authController.join_post);

module.exports = router;
