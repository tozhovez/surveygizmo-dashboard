const mongoose = require('../lib/mongoose');

const surveyResponseSchema = mongoose.Schema({
  submittedAt: Date,
  contents: {},
  status: {
    accountCreated: Boolean,
    grantedCcxRole: Boolean,
    sentPasswordReset: Boolean
  }
});

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = SurveyResponse;
