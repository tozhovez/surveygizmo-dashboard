const mongoose = require('../lib/Mongoose');

const surveyResponseSchema = mongoose.Schema({
  fullName: String,
});

module.exports = mongoose.Model('SurveyResponse', surveyResponseSchema);
