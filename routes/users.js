var express = require('express');
var router = express.Router();

const config = require('../config/main');
const {getUserInfo} = require('../middlewares/auth');
const lmsPort = config.lmsPort;
const loginUrl = `${config.baseUrl}:${config.applicationPort}/users/login`;
const redirectOnLoginUrl = `${config.baseUrl}:${config.applicationPort}`;
const lmsUrl = `${config.baseUrl}:${config.lmsPort}`;
const edxLogoutUrl = `${config.baseUrl}:${config.lmsPort}/logout`;

const {authorize, storeAccessToken, logout} = require('edx-oauth-middleware').init({
  loginUrl,
  redirectOnLoginUrl,
  lmsUrl,
  edxLogoutUrl,
  client: config.client,
  auth: config.auth
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/auth', authorize);

router.get('/login', storeAccessToken, getUserInfo);

router.get('/logout', logout);

module.exports = router;
