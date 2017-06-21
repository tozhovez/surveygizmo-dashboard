const express = require('express');
const config = require('../config/main');
const { getUserInfo } = require('../middlewares/auth');

const router = express.Router();

const { authorize, storeAccessToken, logout } = require('edx-oauth-middleware').init({
  loginUrl: `${config.baseUrl}/users/login`,
  redirectOnLoginUrl: config.baseUrl,
  lmsUrl: config.lmsUrl,
  edxLogoutUrl: `${config.lmsUrl}/logout`,
  client: config.client,
  auth: config.auth
});

router.get('/auth', authorize);

router.get('/login', storeAccessToken, getUserInfo);

router.get('/logout', logout);

module.exports = router;
