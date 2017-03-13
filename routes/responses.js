const express = require('express');
const router = express.Router();
const surveyGizmo = require('../lib/SurveyGizmo');
const EdxApi = require('../lib/EdxApi');

const config = require('../config/main');

router.get('/', (req, res, next) =>
  surveyGizmo.getData()
  .then(json => res.send(json))
  .catch(error => next(error))
);

router.post('/:responseId/approve', (req, res, next) =>
  surveyGizmo.getResponse(req.params.responseId)
  .then(response => EdxApi.createAccount(response.questions))
  .then(account => EdxApi.grantCcxRole(account, req.session.token.access_token))
  .then(account => EdxApi.sendResetPasswordRequest(account))
  .then(account => res.send(account.username))
  .catch(error => next(error))
);

module.exports = router;
