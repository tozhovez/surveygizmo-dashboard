const config = require('../config/main');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request').defaults({jar: true}));

class EdxApi {
  /**
   * Creates edX account with given data.
   * @param {object} data - Contains user info.
   * @returns {object} whatever
   */
  createAccount(data) {
    var url = `${config.baseUrl}:${config.lmsPort}/user_api/v1/account/registration/`;
    var mailingAddress = `${data['Street Address']}, ${data['City']}, ${data['Zip']} ${data['State']}, ${data['country']}`;
    var formData = {
      email: data['Email Address'],
      name: `${data['First Name']} ${data['Last Name']}`,
      username: `${data['First Name']}${data['Last Name']}`,
      password: 'passverd',
      level_of_education: 'p',
      level_of_incompetence: 'this',
      gender: 'm',
      year_of_birth: '1999',
      mailing_address: mailingAddress,
      goals: '',
      honor_code: 'true'
    }

    return request.postAsync({url: url, form: formData})
      .then(() => { return formData });
  }

  /**
   * Grants CCX role for given username.
   * @param {string} username of the user we want to grant CCX role
   * @param {string} accessToken - OAuth2 access_token we use for logging in the user
   * @returns {string} username of the user that was granted CCX role
   */
  grantCcxRole(username, accessToken) {
    const jar = request.jar();
    const courseId = 'course-v1:edX+DemoX+Demo_Course';
    const formData = {
      unique_student_identifier: username,
      rolename: 'ccx_coach',
      action: 'allow'
    };

    return request.postAsync(
      {
        url: `${config.baseUrl}:${config.lmsPort}/oauth2/login/`,
        jar: jar, // binks
        form: { access_token: accessToken }
      })
      .then(response => {
        const setCookies = response.headers['set-cookie'];
        var csrf;
        setCookies.forEach(cookie => {
          if(cookie.indexOf('csrf') >= 0) {
            csrf = cookie.split('csrftoken=')[1].split(';')[0];
          }
          jar.setCookie(cookie.replace(/"/g, ''), `${config.baseUrl}:${config.lmsPort}/`);
        })

        // staff is logged in, do your shit
        return request.postAsync(
          {
            url: `${config.baseUrl}:${config.lmsPort}/courses/${courseId}/instructor/api/modify_access`,
            form: formData,
            headers: {
              'X-CSRFToken': csrf
            },
            jar: jar // binks
          })
        }
      )
      .then(() => {
        return username;
      });
  }
}

module.exports = new EdxApi();
