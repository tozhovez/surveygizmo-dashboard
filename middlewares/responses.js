const surveyGizmo = require('../lib/SurveyGizmo');
const EdxApi = require('../lib/EdxApi');
const Mailer = require('../lib/mailer');

const SurveyResponse = require('../models/surveyResponse');

const approveResponse = (req, res, next) => {
  const surveyResponse = new SurveyResponse({
    responseId: 0,
    submittedAt: '',
    questions: {},
    status: {
      accountCreated: null,
      grantedCcxRole: null,
      sentPasswordReset: null,
      rejected: null
    }
  });
  const emailContent = req.body.emailContent;

  surveyGizmo.getResponseData(req.params.responseId)
  .then(response => {
    surveyResponse.responseId = response.id;
    surveyResponse.submittedAt = response.submittedAt;
    surveyResponse.questions = response.questions;

    return surveyResponse.save().then(() => response);
  })
  .then(response => EdxApi.createAccount(response.questions))
  .then(account => {
    surveyResponse.status.accountCreated = new Date();
    return surveyResponse.save().then(() => account);
  })
  .then(account => EdxApi.grantCcxRole(account, req.session.token.access_token))
  .then(account => {
    surveyResponse.status.grantedCcxRole = new Date();

    return surveyResponse.save().then(() => account);
  })
  .then(account => EdxApi.sendResetPasswordRequest(account))
  .then(account => {
    surveyResponse.status.sentPasswordReset = new Date();
    return surveyResponse.save().then(() => account);
  })
  .then(account => Mailer.send({
    to: account.email,
    subject: 'FastTrac Application Approved',
    text: emailContent,
    html: emailContent }).then(() => account)
  )
  .then(() => res.send(surveyResponse))
  .catch(error => next(error));
};

const rejectResponse = (req, res, next) => {
  const { email, emailContent } = req.body;
  const surveyResponse = new SurveyResponse({
    submittedAt: '',
    questions: {},
    status: {
      accountCreated: null,
      grantedCcxRole: null,
      sentPasswordReset: null,
      rejected: new Date()
    }
  });

  surveyGizmo.getResponseData(req.params.responseId)
  .then(response => {
    surveyResponse.questions = response.questions;
    surveyResponse.submittedAt = response.submittedAt;

    return Mailer.send({
      to: email,
      subject: 'FastTrac Application Rejected',
      text: emailContent,
      html: emailContent
    });
  })
  .then(result => {
    surveyResponse.save();
    res.send(result);
  })
  .catch(error => next(error));
};

module.exports = { approveResponse, rejectResponse };
