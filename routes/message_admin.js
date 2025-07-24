const express = require('express');
const router = express.Router();
const pool = require('../db');

// Delete message (admin only)
router.post('/message/:id/delete', async (req, res) => {
  if (!req.user || req.user.status !== 'admin') {
    return res.status(403).send('Forbidden: Only admins can delete messages.');
  }
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting message.');
  }
});

module.exports = router;
