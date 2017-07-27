const config = require('../config/main');
const request = require('./request');
const getStateAbbreviation = require('./usStateAbbreviations');
const { UserDataException } = require('./customExceptions');
const { getRandomIntInRange } = require('./helpers');

const jar = request.jar();
request.defaults({ jar });

const apiUrls = {
  registration: `${config.lmsUrl}/user_api/v1/account/registration/`,
  enrollStudent: `${config.lmsUrl}/courses/${config.facilitatorCourseId}/instructor/api/students_update_enrollment`,
  courseAccess: `${config.lmsUrl}/courses/${config.courseId}/instructor/api/modify_access`,
  facilitatorCourseAccess: `${config.lmsUrl}/courses/${config.facilitatorCourseId}/instructor/api/modify_access`,
  passwordReset: `${config.lmsUrl}/password_reset/`
};

class EdxApi {
  /**
   * Creates edX account with given data.
   * @param {object} data - Contains user info.
   * @returns {Promise} which returns info if account was created and submitted form data
   */
  createAccount(data) {
    const url = apiUrls.registration;
    const first_name = data['Submitter First Name']; // eslint-disable-line camelcase
    const last_name = data['Submitter Last Name']; // eslint-disable-line camelcase
    const name = `${first_name} ${last_name}`; // eslint-disable-line camelcase
    const form = {
      email: data['Submitter Email'],
      first_name,
      last_name,
      name,
      username: name.replace(/[^a-z0-9]/gi, ''),
      country: 'US',
      password: 'passverd', // TODO: generate random password
      level_of_education: 'p',
      gender: 'o',
      year_of_birth: '1911',
      mailing_address: data['Street Address'],
      secondary_address: data['Street Address 2'],
      goals: '',
      honor_code: 'true',
      bio: 'other', // TODO, currenty it's a dropdown on edX side, but it's not implemented in SG
      zipcode: data['Postal Code'],
      city: data.City,
      state: data.State === 'Washington, D.C.' ? 'WD' : getStateAbbreviation(data.State),
      affiliate_organization_name: data['Organization Name'],
      company: data['Organization Name'],
      phone_number: data['Public Contact Phone number - please format: xxx-xxx-xxxx'],
      facebook_link: data['Social - Facebook'],
      linkedin_link: data['Social - Linkedin'],
      twitter_link: data['Social - Twitter'],
      public_email: data['Public Contact E-mail']
    };

    return request.postAsync({ url, form })
      .then(response => {
        if (response.statusCode === 400) {
          const errors = JSON.parse(response.body);
          throw new UserDataException(errors);
        }

        if (response.statusCode === 409) {
          const conflicts = JSON.parse(response.body);

          if (conflicts.email) {
            return {
              isCreated: false,
              form
            };
          } else if (conflicts.username) {
            return this.createRecursivelyWithNewUsername(url, form, response);
          }
        }

        if (response.statusCode === 200) {
          return {
            isCreated: true,
            form
          };
        }

        throw new Error('Oops, something went bad!');
      });
  }

  createRecursivelyWithNewUsername(url, form, response) {
    if (response.statusCode === 200) {
      return {
        isCreated: true,
        form
      };
    }

    const conflicts = JSON.parse(response.body);

    if (!conflicts.username) {
      throw new Error('Oops, something went bad!');
    }

    const newForm = Object.assign(
      form, { username: `${form.username}${getRandomIntInRange(0, 9)}` }
    );

    return request.postAsync({ url, form: newForm })
    .then(newResponse => this.createRecursivelyWithNewUsername(url, newForm, newResponse));
  }

  /**
   * Enrolls user into facilitator course which ID is given in config.json
   * @param {object} req Express request
   * @param {object} account account object that edX API returns
   * @returns {Promise} result of HTTP request
   */
  enrollUserIntoFacilitatorCourse(req, account) {
    const { email } = account;
    const options = this.getUserCookies(req);
    const form = {
      action: 'enroll',
      identifiers: email,
      auto_enroll: true,
      email_students: false
    };

    options.url = apiUrls.facilitatorCourseAccess;
    options.form = form;

    return request.postAsync(options)
    .then(response => {
      if (response.statusCode !== 200) {
        throw new Error(response.body);
      }
    });
  }

  /**
   * Grants CCX role for given email. It logs user in with OAuth2 and
   * calls an API to grant CCX role on a course defined in config.
   *
   * @param {object} req Express request
   * @param {object} account account object that edX API returns
   * @returns {Promise} result of HTTP request
   */
  grantCcxRole(req, account) {
    const options = this.getUserCookies(req);

    options.url = apiUrls.courseAccess;
    options.form = this.getFormData(account.email);

    return request.postAsync(options)
    .then(response => {
      if (response.statusCode !== 200) {
        throw new Error(response.body);
      }
    });
  }

  grantCcxRoleFaciliatorCourse(req, account) {
    const options = this.getUserCookies(req);

    options.url = apiUrls.facilitatorCourseAccess;
    options.form = this.getFormData(account.email);

    return request.postAsync(options)
    .then(response => {
      if (response.statusCode !== 200) {
        throw new Error(response.body);
      }
    });
  }

  /**
   * Submits reset password request on edX in behalf of account received in params.
   * @param {object} account object that edX API returns
   * @returns {Promise} result of HTTP request
   */
  sendResetPasswordRequest({ email }) {
    const options = {
      url: apiUrls.passwordReset,
      form: { email, survey_gizmo: 'true' }
    };

    return request.postAsync(options);
  }

  /**
   * Helper function to build CCX role grant form data for given email
   *
   * @param {string} email
   * @returns {object} form data for this email
   */
  getFormData(email) {
    return {
      unique_student_identifier: email,
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

    Object.keys(req.cookies).forEach(key => {
      const cookie = req.cookies[key];
      const cookieObject = request.cookie(`${key}=${cookie}`);

      jar.setCookie(cookieObject, config.lmsUrl);

      if (key === 'csrftoken') {
        csrf = cookie;
      }
    });

    return {
      headers: { 'X-CSRFToken': csrf, Referer: config.lmsUrl },
      jar
    };
  }
}

module.exports = new EdxApi();
