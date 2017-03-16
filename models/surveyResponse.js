const mongoose = require('../lib/Mongoose');

const surveyResponseSchema = mongoose.Schema({
  submittedAt: Date,
  contents: [{
    question: String,
    answer: String
  }],
  status: {
    accountCreated: Boolean,
    grantedCcxRole: Boolean,
    sentPasswordReset: Boolean
  }
});

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = SurveyResponse;
