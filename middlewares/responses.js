const surveyGizmo = require('../lib/SurveyGizmo');
const EdxApi = require('../lib/EdxApi');
const Mailer = require('../lib/mailer');
const { UserDataException } = require('../lib/customExceptions');
const SurveyResponse = require('../models/surveyResponse');

const approveResponse = (req, res, next) => {
  const { access_token: accessToken } = req.session.token;
  const { email, emailContent } = req.body;
  const { responseId } = req.params;

  SurveyResponse.getByEmail(email)
    .then(surveyResponse => {
      if (surveyResponse && isApprovedOrRejected(surveyResponse)) {
        return res.send(surveyResponse);
      }

      /**
     * Catch {UserDataException} if doApproveResponse throws one,
     * otherwise continue with promise chain
     */
      return doApproveResponse(emailContent, responseId, accessToken, req)
        .catch(UserDataException, exception => {
          res.status(400).send(exception.message);
        })
        .then(response => res.send(response))
        .catch(error => res.status(500).send(error));
    })
    .catch(error => next(error));
};

const isApprovedOrRejected = ({ status }) =>
  status &&
  ((status.accountCreated &&
    status.sentPasswordReset) ||
    status.rejected);

/**
 * Function does all the approval logic through the chain of promises.
 *
 * Once the response data is fetched from db,
 * createAccount is called from EdxApi and response status is updated in db.
 *
 * Return value of createAccount is destructured into:
 * {isCreated} - boolean indicating whether account was created in edX or already existed
 * {form} - holds account info
 * Only if account was created reset password email is sent
 *
 * @param {string} emailContent for email sent on response approval
 * @param {number} responseId used to fetch response data from db
 * @param {string} token fetched from session, used to login current user into edX
 */
const doApproveResponse = (emailContent, responseId, token, req) => {
  let account;
  let data;
  let surveyResponse;

  return surveyGizmo
    .getResponseData(responseId)
    .then(responseData => {
      data = responseData;
    })
    .then(() =>
      SurveyResponse.findOne({
        'questions.Submitter Email': data.questions['Submitter Email']
      })
    )
    .then(response => {
      if (!response) {
        surveyResponse = new SurveyResponse();
      } else {
        surveyResponse = response;
      }
    })
    .then(() => surveyResponse.setData(data))
    .then(() => EdxApi.createAccount(surveyResponse.questions))
    .catch(UserDataException, exception => {
      throw exception;
    })
    .then(({ isCreated, form }) => { // eslint-disable-line consistent-return
      account = form;

      if (isCreated) {
        return EdxApi.sendResetPasswordRequest(account)
        .then(() => sendApprovalEmail(account.email, emailContent))
        .then(() => surveyResponse.setSentPasswordReset());
      }

      return sendApprovalEmail(account.email, emailContent);
    })
    .then(() => surveyResponse.setAccountCreated())
    .then(() => EdxApi.createAffiliateEntity(req, surveyResponse.questions))
    .then(() => surveyResponse);
};

const sendApprovalEmail = (email, content) => Mailer.send({
  to: email,
  subject: 'Kauffman FastTrac Affiliate Approval',
  text: content,
  html: content
})

const rejectResponse = (req, res, next) => {
  const { email, emailContent } = req.body;
  let data;
  let surveyResponse;

  return surveyGizmo
    .getResponseData(req.params.responseId)
    .then(responseData => {
      data = responseData;
    })
    .then(() =>
      SurveyResponse.findOne({
        'questions.Submitter Email': data.questions['Submitter Email']
      })
    )
    .then(response => {
      if (!response) {
        surveyResponse = new SurveyResponse();
      } else {
        surveyResponse = response;
      }
    })
    .then(() => surveyResponse.setData(data))
    .then(() => surveyResponse.setRejected())
    .then(() =>
      Mailer.send({
        to: email,
        subject: 'FastTrac Application Rejected',
        text: emailContent,
        html: emailContent
      })
    )
    .then(() => res.send(surveyResponse))
    .catch(error => next(error));
};

module.exports = { approveResponse, rejectResponse };
