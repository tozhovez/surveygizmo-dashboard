const request = require('request').defaults({jar: true});
const config = require('../config/main');

class EdxApi {
  /**
   * Creates edX account with given data.
   * @param {object} data - Contains user info.
   * @returns {object} whatever
   */
  createAccount(data) {
    return new Promise((resolve, _) => {
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

      request.post({url: url, form: formData}, (error, response, body) => {
        if(error) {
          throw error;
        }
        else {
          resolve(formData);
        }
      });
    })
  }

  /**
   * Grants CCX role for given username.
   * It logs in global staff user since they have permission to change roles on a course
   * and sends a request as that user.
   * @param {string} username
   * @returns {string} username
   */
  grantCcxRole(username, accessToken) {
    return new Promise((resolve, reject) => {
      const jar = request.jar();
      const courseId = 'course-v1:edX+DemoX+Demo_Course';
      const formData = {
        unique_student_identifier: username,
        rolename: 'ccx_coach',
        action: 'allow'
      };

      request.post(
        {
          url: `${config.baseUrl}:${config.lmsPort}/oauth2/login/`,
          jar: jar, // binks
          form: { access_token: accessToken }
        },
        function(error, response, body){
          const setCookies = response.headers['set-cookie'];
          var csrf;
          setCookies.forEach(cookie => {
            if(cookie.indexOf('csrf') >= 0) {
              csrf = cookie.split('csrftoken=')[1].split(';')[0];
            }
            jar.setCookie(cookie.replace(/"/g, ''), `${config.baseUrl}:${config.lmsPort}/`);
          })


          // staff is logged in, do your shit
          request.post(
            {
              url: `${config.baseUrl}:${config.lmsPort}/courses/${courseId}/instructor/api/modify_access`,
              form: formData,
              headers: {
                'X-CSRFToken': csrf
              },
              jar: jar // binks
            },
            (error, response, body) => {
              resolve(username);
            }
          );
        }
      );
    })
  }
}

module.exports = new EdxApi();
