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
    .then(response => res.send(response));
  })
  .catch(error => next(error));
};

const isApprovedOrRejected = ({ status }) => status &&
  (status.accountCreated &&
  status.sentPasswordReset &&
  status.grantedCcxRole ||
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
 * At the end, user is granted ccx role
 * @param {string} emailContent for email sent on response approval
 * @param {number} responseId used to fetch response data from db
 * @param {string} token fetched from session, used to login current user into edX
 */
const doApproveResponse = (emailContent, responseId, token, req) => {
  let account;
  const surveyResponse = new SurveyResponse();

  return surveyGizmo.getResponseData(responseId)
  .then(data => surveyResponse.setData(data))
  .then(() => surveyResponse.setAccountCreated())
  .then(() => EdxApi.createAccount(surveyResponse.questions))
  .catch(UserDataException, exception => {
    throw exception;
  })
  .then(({ isCreated, form }) => {
    account = form;

    if (isCreated) {
      EdxApi.sendResetPasswordRequest(account)
      .then(() => surveyResponse.setSentPasswordReset());
    }
    // don't send password request email, but record that we passed this step
    // so we can track response status better
    else {
      surveyResponse.setSentPasswordReset();
    }
  })
  .then(() => EdxApi.enrollUserIntoFacilitatorCourse(req, account))
  .then(() => EdxApi.grantCcxRole(req, account))
  .then(() => EdxApi.grantCcxRoleFaciliatorCourse(req, account))
  .then(() => surveyResponse.setGrantedCcxRole())
  .then(() => surveyResponse);
};

const rejectResponse = (req, res, next) => {
  const { email, emailContent } = req.body;
  const surveyResponse = new SurveyResponse();

  surveyGizmo.getResponseData(req.params.responseId)
  .then(response => surveyResponse.setData(response))
  .then(() => surveyResponse.setRejected())
  .then(() => Mailer.send({
    to: email,
    subject: 'FastTrac Application Rejected',
    text: emailContent,
    html: emailContent
  }))
  .then(() => res.send(surveyResponse))
  .catch(error => next(error));
};

module.exports = { approveResponse, rejectResponse };
