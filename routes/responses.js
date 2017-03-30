const express = require('express');
const surveyGizmo = require('../lib/SurveyGizmo');
const { approveResponse, rejectResponse } = require('../middlewares/responses');

const router = express.Router();

router.get('/', (req, res, next) =>
  surveyGizmo.getResponseData()
  .then(json => res.send(json))
  .catch(error => next(error))
);

router.get('/page/:page', (req, res, next) =>
  surveyGizmo.getResponseData(null, req.params.page)
  .then(json => res.send(json))
  .catch(error => next(error))
);

router.get('/:responseId', (req, res, next) =>
  surveyGizmo.getResponseData(req.params.responseId)
  .then(json => res.send(json))
  .catch(error => next(error))
);

router.post('/:responseId/approve', approveResponse);

router.post('/:responseId/reject', rejectResponse);

module.exports = router;
