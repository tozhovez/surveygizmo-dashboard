const axios = require('axios');
const config = require('../config/main');

const getUserInfo = (req, res) => {
  const accessToken = req.session.token.access_token;
  const options = {
    method: 'GET',
    url: `${config.lmsUrl}/oauth2/user_info`,
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


const requiresStaffRole = (req, res, next) => {
  if (typeof req.session.isStaff === 'undefined') {
    storeUserRole(req)
    .then(() => {
      checkStaff(req, res, next);
    });
  } else {
    checkStaff(req, res, next);
  }
};

const checkStaff = (req, res, next) => {
  if (req.session.isStaff) {
    next();
  }
  else {
    res.status(403);
    res.send('Access is forbidden for non-staff user!');
  }
};

const storeUserRole = req => {
  const accessToken = req.session.token && req.session.token.access_token;
  const options = {
    method: 'GET',
    url: `${config.lmsUrl}/api/user/v1/is_staff`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  return axios(options)
  .then(response => {
    req.session.isStaff = response.data;
  });
};

module.exports = { getUserInfo, requiresStaffRole };
