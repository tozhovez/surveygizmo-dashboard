var express = require('express');
var router = express.Router();
var surveyGizmo = require('../lib/SurveyGizmo');
var EdxApi = require('../lib/EdxApi');

const config = require('../config/main');

router.get('/', (req, res, next) => {
  surveyGizmo.getData()
    .then(json => { res.send(json) })
    .catch(error => { next(error) })
});


router.get('/:responseId/approve', (req, res, next) => {
  EdxApi.grantCcxRole('Laury', req.session.token.access_token).then(data => res.send(data));
  // surveyGizmo.getResponse(req.params.responseId)
  // .then(response => {
  //   console.log(response);
  //   return EdxApi.createAccount(response.questions);
  // })
  // .then(account => {
  //   return EdxApi.grantCcxRole(account, req.session);
  // })
  // .then(response => {
  //   res.send(JSON.stringify(response));
  // })
  // .catch(error => {
  //   next(error);
  // });
});



module.exports = router;
