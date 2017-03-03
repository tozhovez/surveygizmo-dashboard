const express = require('express');
const router = express.Router();
const app = require('../app');
const surveyGizmo = require('../lib/SurveyGizmo');

/* GET dashboard */
router.get('/', (req, res, _) => {
  res.render('dashboard');
});

router.get('/responses', (req, res, _) => {
  surveyGizmo.renderData()
    .then(json => {
      res.send(json);
    })
    .catch(error => {throw error});
});

module.exports = router;
