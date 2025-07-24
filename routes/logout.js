const express = require('express');
const router = express.Router();

router.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error logging out.');
    }
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

module.exports = router;
