/* eslint-disable */
const config = require('../config/main');
const request = require('./request');
const getStateAbbreviation = require('./usStateAbbreviations');
const { UserDataException } = require('./customExceptions');

const jar = request.jar();
request.defaults({ jar });

class EdxApi {
  /**
   * Creates edX account with given data.
   * @param {object} data - Contains user info.
   * @returns {object} whatever
   */
  createAccount(data) {
    const url = `${config.lmsUrl}/user_api/v1/account/registration/`;
    const mailingAddress = `${data['Street Address']}, ${data['City']}, ${data['Postal Code']} ${data['State']}`;
    const first_name = data['Submitter First Name'];
    const last_name = data['Submitter Last Name'];
    const name = `${first_name} ${last_name}`;
    const form = {
      email: data['Submitter Email'],
      first_name,
      last_name,
      name,
      username: name.replace(/[^a-z0-9]/gi,''),
      country: getStateAbbreviation(data['State']),
      password: 'passverd', // TODO: generate random password
      level_of_education: 'p',
      gender: 'm',
      year_of_birth: '1999',
      mailing_address: mailingAddress,
      goals: '',
      honor_code: 'true',
      bio: 'other', // TODO, currenty it's a dropdown on edX side, but it's not implemented in SG
      zipcode: data['Postal Code'],
      city: data['City'],
      state: data['State'],
      affiliate_organization_name: data['Organization Name']
    };

    return request.postAsync({ url, form })
      .then(response => {
        if (response.statusCode === 400) {
          const errors = JSON.parse(response.body);
          throw new UserDataException(errors);
        }

        if (response.statusCode === 409){
          return {
            isCreated: false,
            form
          };
        }

        if (response.statusCode === 200){
          return {
            isCreated: true,
            form
          };
        }

        throw new Error('Oops, something went bad!');
      });
  }

  /**
   * Grants CCX role for given username. It logs user in with OAuth2 and
   * calls an API to grant CCX role on a course defined in config.
   *
   * @param {string} username of the user we want to grant CCX role
   * @param {string} accessToken - OAuth2 access_token we use for logging in the user
   * @returns {string} username of the user that was granted CCX role
   */
  grantCcxRole(req, account, accessToken) {
    const courseId = config.courseId;
    const options = this.getUserCookies(req);

    options['url'] = `${config.lmsUrl}/courses/${courseId}/instructor/api/modify_access`;
    options['form'] = this.getFormData(account.username);

    return request.postAsync(options);
  }

  sendResetPasswordRequest(account) {
    const { email } = account;
    const options = {
      url: `${config.lmsUrl}/password_reset/`,
      form: { email, survey_gizmo: 'true' }
    };

    return request.postAsync(options);
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

  /**
   * Helper function to fetch user's cookies from request object
   * and format them in a way suitable for use in request functions
   *
   * @param {object} req
   * @returns {object} containing cookie jar with user's cookies and CSRF header token
   */
  getUserCookies(req) {
    let csrf;

    for (const key in req.cookies) {
      const cookie = req.cookies[key];
      const cookieObject = request.cookie(`${key}=${cookie}`);

      jar.setCookie(cookieObject, config.lmsUrl);

      if (key === 'csrftoken') {
        csrf = cookie;
      }
    }

    return {
      headers: { 'X-CSRFToken': csrf },
      jar
    };
  }
}

module.exports = new EdxApi();
