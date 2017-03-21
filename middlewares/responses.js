const surveyGizmo = require('../lib/SurveyGizmo');
const EdxApi = require('../lib/EdxApi');

const SurveyResponse = require('../models/surveyResponse');

const approveResponse = (req, res, next) => {
  const surveyResponse = new SurveyResponse({
    submittedAt: '',
    questions: {},
    status: {
      accountCreated: false,
      grantedCcxRole: false,
      sentPasswordReset: false
    }
  });

  surveyGizmo.getResponseData(req.params.responseId)
  .then(response => {
    surveyResponse.questions = response.questions;
    surveyResponse.submittedAt = response.submittedAt;

    return surveyResponse.save().then(() => response);
  })
  .then(response => EdxApi.createAccount(response.questions))
  .then(account => {
    surveyResponse.status.accountCreated = true;

    return surveyResponse.save().then(() => account);
  })
  .then(account => EdxApi.grantCcxRole(account, req.session.token.access_token))
  .then(account => {
    surveyResponse.status.grantedCcxRole = true;

    return surveyResponse.save().then(() => account);
  })
  .then(account => EdxApi.sendResetPasswordRequest(account))
  .then(account => {
    surveyResponse.status.sentPasswordReset = true;

    return surveyResponse.save().then(() => account);
  })
  .then(account => res.send(account.username))
  .catch(error => next(error));
};

module.exports = { approveResponse };
