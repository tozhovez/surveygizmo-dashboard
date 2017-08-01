const mongoose = require('../lib/mongoose');

const surveyResponseSchema = mongoose.Schema({
  responseId: Number,
  submittedAt: String,
  questions: {},
  status: {
    accountCreated: { type: Date, default: null },
    sentPasswordReset: { type: Date, default: null },
    rejected: { type: Date, default: null }
  }
});

surveyResponseSchema.methods.setData = function ({ id, submittedAt, questions }) {
  this.responseId = id;
  this.submittedAt = submittedAt;
  this.questions = questions;
  return this.save();
};

surveyResponseSchema.methods.setAccountCreated = function () {
  if (!this.status.accountCreated) {
    this.status.accountCreated = new Date();
  }
  return this.save();
};

surveyResponseSchema.methods.setSentPasswordReset = function () {
  if (!this.status.sentPasswordReset) {
    this.status.sentPasswordReset = new Date();
  }
  return this.save();
};

surveyResponseSchema.methods.setRejected = function () {
  if (!this.status.rejected) {
    this.status.rejected = new Date();
  }
  return this.save();
};

surveyResponseSchema.statics.getByEmail = function (email) {
  return this.findOne({ 'questions.Submitter Email': email });
};

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = SurveyResponse;
