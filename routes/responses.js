const express = require('express');
const surveyGizmo = require('../lib/SurveyGizmo');
const { approveResponse } = require('../middlewares/responses');

const router = express.Router();

router.get('/', (req, res, next) =>
  surveyGizmo.getResponseData()
  .then(json => res.send(json))
  .catch(error => next(error))
);

router.get('/:responseId', (req, res, next) =>
  surveyGizmo.getResponseData(req.params.responseId)
  .then(json => res.send(json))
  .catch(error => next(error))
);

router.post('/:responseId/approve', approveResponse);

module.exports = router;
