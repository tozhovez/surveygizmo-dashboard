var express = require('express');
var router = express.Router();
var surveyGizmo = require('../lib/SurveyGizmo');
var EdxApi = require('../lib/EdxApi');

const config = require('../config/main');

router.get('/', (req, res, next) => {
  surveyGizmo.getData()
    .then(json => res.send(json))
    .catch(error => next(error))
});


router.post('/:responseId/approve', (req, res, next) => {
  surveyGizmo.getResponse(req.params.responseId)
  .then(response => EdxApi.createAccount(response.questions))
  .then(account => EdxApi.grantCcxRole(account.username, req.session.token.access_token))
  .then(username => res.send(username))
  .catch(error => next(error));
});



module.exports = router;
