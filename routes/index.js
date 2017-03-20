const express = require('express');

const router = express.Router();

/* GET dashboard */
router.get('/', (req, res) => {
  res.render('dashboard');
});

module.exports = router;
