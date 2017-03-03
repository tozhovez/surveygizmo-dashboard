var express = require('express');
var router = express.Router();
var surveyGizmo = require('../lib/SurveyGizmo');

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
