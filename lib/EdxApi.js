const config = require('../config/main');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));

const jar = request.jar();
request.defaults({ jar });

class EdxApi {
  /**
   * Creates edX account with given data.
   * @param {object} data - Contains user info.
   * @returns {object} whatever
   */
  createAccount(data) {
    const url = `${config.baseUrl}:${config.lmsPort}/user_api/v1/account/registration/`;
    const mailingAddress = `${data['Street Address']}, ${data['City']}, ${data['Zip']} ${data['State']}, ${data['country']}`;
    const form = {
      email: data['Email Address'],
      name: `${data['First Name']} ${data['Last Name']}`,
      username: `${data['First Name']}${data['Last Name']}`,
      password: 'passverd', // TODO: generate random password
      level_of_education: 'p',
      level_of_incompetence: 'this',
      gender: 'm',
      year_of_birth: '1999',
      mailing_address: mailingAddress,
      goals: '',
      honor_code: 'true'
    };

    return request.postAsync({ url, form })
      .then(() => form);
  }

  /**
   * Grants CCX role for given username. It logs user in with OAuth2 and
   * calls an API to grant CCX role on a course defined in config.
   *
   * @param {string} username of the user we want to grant CCX role
   * @param {string} accessToken - OAuth2 access_token we use for logging in the user
   * @returns {string} username of the user that was granted CCX role
   */
  grantCcxRole(account, accessToken) {
    const courseId = config.courseId;
    const form = this.getFormData(account.username);
    const options = {
      url: `${config.baseUrl}:${config.lmsPort}/oauth2/login/`,
      form: { access_token: accessToken }
    }

    // log in current user and get their session and CSRF cookies
    return request.postAsync(options)
      .then(response => {
        // set cookies and get CSRF Token
        let csrf;
        response.headers['set-cookie'].forEach(cookie => {
          if (cookie.indexOf('csrf') >= 0) {
            csrf = cookie.split('csrftoken=')[1].split(';')[0];
          }
          jar.setCookie(cookie.replace(/"/g, ''), `${config.baseUrl}:${config.lmsPort}/`);
        });

        const options = {
          url: `${config.baseUrl}:${config.lmsPort}/courses/${courseId}/instructor/api/modify_access`,
          form,
          headers: { 'X-CSRFToken': csrf },
          jar: jar //binks
        };
        // send request
        return request.postAsync(options);
        })
      .then(() => account);
  }

  sendResetPasswordRequest(account) {
    const { email } = account;
    const options = {
      url: `${config.baseUrl}:${config.lmsPort}/api/reset_password`,
      form: { email }
    }

    return request.postAsync(options)
      .then(() => account);
  }

  /**
   * Helper function to build CCX role grant form data for given username
   *
   * @param {string} username
   * @returns {object} form data for this username
   */
  getFormData(username) {
    return {
      unique_student_identifier: username,
      rolename: 'ccx_coach',
      action: 'allow'
    };
  }
}

module.exports = new EdxApi();
