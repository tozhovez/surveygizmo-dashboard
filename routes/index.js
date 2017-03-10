const express = require('express');
const router = express.Router();

/* GET dashboard */
router.get('/', (req, res, _) => {
  res.render('dashboard');
});

module.exports = router;
