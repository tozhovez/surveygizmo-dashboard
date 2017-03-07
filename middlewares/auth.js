const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request').defaults({jar: true}));
const {baseUrl, lmsPort} = require('../config/main');

module.exports.getUserInfo = (req, res, next) => {
  const accessToken = req.session.token.access_token;
  let options = {
    url: `${baseUrl}:${lmsPort}/oauth2/user_info`,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  request.getAsync(options)
  .then(response => {
    req.session.user = JSON.parse(response.body);
    res.redirect('/');
  })
  .catch(error => res.send(`Access Token Error ${error.message}`));
};