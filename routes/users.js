const express = require('express');
const config = require('../config/main');
const { getUserInfo } = require('../middlewares/auth');

const router = express.Router();
const loginUrl = `${config.baseUrl}:${config.applicationPort}/users/login`;
const redirectOnLoginUrl = `${config.baseUrl}:${config.applicationPort}`;
const lmsUrl = `${config.baseUrl}:${config.lmsPort}`;
const edxLogoutUrl = `${config.baseUrl}:${config.lmsPort}/logout`;

const { authorize, storeAccessToken, logout } = require('edx-oauth-middleware').init({
  loginUrl,
  redirectOnLoginUrl,
  lmsUrl,
  edxLogoutUrl,
  client: config.client,
  auth: config.auth
});

router.get('/auth', authorize);

router.get('/login', storeAccessToken, getUserInfo);

router.get('/logout', logout);

module.exports = router;
