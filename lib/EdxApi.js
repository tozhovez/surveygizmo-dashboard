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
   * @returns {Promise} which returns info if account was created and submitted form data
   */
  createAccount(data) {
    const url = `${config.lmsUrl}/user_api/v1/account/registration/`;
    const first_name = data['Submitter First Name'];
    const last_name = data['Submitter Last Name'];
    const name = `${first_name} ${last_name}`;
    const form = {
      email: data['Submitter Email'],
      first_name,
      last_name,
      name,
      username: name.replace(/[^a-z0-9]/gi,''),
      country: 'US',
      password: 'passverd', // TODO: generate random password
      level_of_education: 'p',
      gender: 'o',
      year_of_birth: '1999',
      mailing_address: data['Street Address'],
      secondary_address: data['Street Address 2'],
      goals: '',
      honor_code: 'true',
      bio: 'other', // TODO, currenty it's a dropdown on edX side, but it's not implemented in SG
      zipcode: data['Postal Code'],
      city: data['City'],
      state: data['State'] === 'Washington, D.C.' ? 'WD' : getStateAbbreviation(data['State']),
      affiliate_organization_name: data['Organization Name'],
      company: data['Organization Name'],
      phone_number: data['Public Contact Phone number'],
      facebook_link: data['Social - Facebook'],
      linkedin_link: data['Social - Linkedin'],
      twitter_link: data['Social - Twitter']
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
   * Enrolls user into facilitator course which ID is given in config.json
   * @param {object} req Express request
   * @param {object} account account object that edX API returns
   * @returns {Promise} result of HTTP request
   */
  enrollUserIntoFacilitatorCourse(req, account) {
    const { username } = account;
    const options = this.getUserCookies(req);
    const form = {
      action: 'enroll',
      identifiers: username,
      auto_enroll: true,
      email_students: false
    }

    options['url'] = `${config.lmsUrl}/courses/${config.facilitatorCourseId}/instructor/api/students_update_enrollment`;
    options['form'] = form;

    return request.postAsync(options)
    .then(response => {
      if(response.statusCode !== 200) {
        throw new Error(response.body);
      }
    });
  }

  /**
   * Grants CCX role for given username. It logs user in with OAuth2 and
   * calls an API to grant CCX role on a course defined in config.
   *
   * @param {object} req Express request
   * @param {object} account account object that edX API returns
   * @returns {Promise} result of HTTP request
   */
  grantCcxRole(req, account) {
    const courseId = config.courseId;
    const options = this.getUserCookies(req);

    options['url'] = `${config.lmsUrl}/courses/${courseId}/instructor/api/modify_access`;
    options['form'] = this.getFormData(account.username);

    return request.postAsync(options)
    .then(response => {
      if(response.statusCode !== 200) {
        throw new Error(response.body);
      }
    });
  }

  /**
   * Submits reset password request on edX in behalf of account received in params.
   * @param {object} account object that edX API returns
   * @returns {Promise} result of HTTP request
   */
  sendResetPasswordRequest({email}) {
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
