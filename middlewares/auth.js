const axios = require('axios');
const { baseUrl, lmsPort } = require('../config/main');

module.exports.getUserInfo = (req, res) => {
  const accessToken = req.session.token.access_token;
  const options = {
    method: 'GET',
    url: `${baseUrl}:${lmsPort}/oauth2/user_info`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  axios(options)
  .then(response => {
    req.session.user = response.data; // eslint-disable-line
    res.redirect('/');
  })
  .catch(error => res.send(`Access Token Error ${error.message}`));
};
