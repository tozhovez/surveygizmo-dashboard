const config = require('../config/main');
const request = require('./request');
const getStateAbbreviation = require('./usStateAbbreviations');
const { UserDataException } = require('./customExceptions');
const { getRandomIntInRange } = require('./helpers');

const jar = request.jar();
request.defaults({ jar });

const apiUrls = {
  registration: `${config.lmsUrl}/user_api/v1/account/registration/`,
  passwordReset: `${config.lmsUrl}/password_reset/`,
  createAffiliate: `${config.lmsUrl}/affiliates/create`
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
      goals: '',
      honor_code: 'true',
      bio: 'other', // TODO, currenty it's a dropdown on edX side, but it's not implemented in SG
      zipcode: data['Postal Code'],
      city: data.City,
      state: data.State === 'Washington, D.C.' ? 'WD' : getStateAbbreviation(data.State),
      company: data['Organization Name'],
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

  createAffiliateEntity(req, data) {
    const options = this.getUserCookies(req);
    const url = apiUrls.createAffiliate;
    const form = {
      member_identifier: data['Submitter Email'],
      email: data['Public Contact E-mail'],
      name: data['Organization Name'],
      country: 'US',
      address: data['Street Address'],
      zipcode: data['Postal Code'],
      city: data.City,
      state: data.State === 'Washington, D.C.' ? 'WD' : getStateAbbreviation(data.State),
      phone_number: data['Public Contact Phone number - please format: xxx-xxx-xxxx'],
      facebook: data['Social - Facebook'],
      linkedin: data['Social - Linkedin'],
      twitter: data['Social - Twitter'],
    };

    options.url = url;
    options.form = form;

    return request.postAsync(options);
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
