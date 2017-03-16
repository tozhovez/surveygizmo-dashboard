const express = require('express');
const surveyGizmo = require('../lib/SurveyGizmo');
const EdxApi = require('../lib/EdxApi');

const SurveyResponse = require('../models/surveyResponse');

const router = express.Router();

router.get('/', (req, res, next) =>
  surveyGizmo.getData()
  .then(json => {
    res.send(json);
  })
  .catch(error => next(error))
);

router.post('/:responseId/approve', (req, res, next) => {
  const data = {
    submittedAt: '',
    questions: [],
    status: {
      accountCreated: false,
      grantedCcxRole: false,
      sentPasswordReset: false
    }
  };

  surveyGizmo.getResponse(req.params.responseId)
  .then(response => {
    data.contents = Object.keys(response.questions)
      .map(key => ({
        question: key,
        answer: response.questions[key]
      }));
    data.submittedAt = response.submittedAt;

    return EdxApi.createAccount(response.questions);
  })
  .then(account => {
    data.status.accountCreated = true;
    return EdxApi.grantCcxRole(account, req.session.token.access_token);
  })
  .then(account => {
    data.status.grantedCcxRole = true;
    return EdxApi.sendResetPasswordRequest(account);
  })
  .then(account => {
    data.status.sentPasswordReset = true;

    const surveyResponse = new SurveyResponse(data);
    surveyResponse.save();

    res.send(account.username);
  })
  .catch(error => next(error));
});

module.exports = router;
