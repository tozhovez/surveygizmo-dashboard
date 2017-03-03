var express = require('express');
var router = express.Router();
var surveyGizmo = require('../lib/SurveyGizmo');

/* GET home page. */
router.get('/', function(req, res, next) {
  surveyGizmo.renderData()
    .then(html => {
      res.send(html);
    })
    .catch(error => {throw error});
});

module.exports = router;
