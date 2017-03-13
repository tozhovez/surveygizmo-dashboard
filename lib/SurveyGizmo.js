const request = require('request');
const config = require('../config/main');
const apiKey = process.env.SG_KEY;
const sgUrl = 'https://restapi.surveygizmo.com/v4/survey';
const sgSurveyId = 3392617;

class SurveyGizmo {
  constructor() {
    this.getQuestion = this.getQuestion.bind(this);
    this.getQuestions = this.getQuestions.bind(this);
    this.getResponses = this.getResponses.bind(this);
    this.getResponse = this.getResponse.bind(this);
    this.getData = this.getData.bind(this);
  }
  /**
   * Makes AJAX request to get people responses.
   * @returns {object} JSON parsed API response.
   */
  getResponses() {
    return new Promise((resolve, reject) => {
      const url = apiKey ? `${sgUrl}/${sgSurveyId}/surveyresponse?api_token=${apiKey}` : `${config.baseUrl}:${config.applicationPort}/surveyresponse.json`;

      request(url, (error, response, body) => {
        if(error) {
          reject(error);
        }
        else {
          this._responses = JSON.parse(body).data;
          resolve(this._responses);
        }
      });
    });
  }

  /**
   * Makes AJAX request to get question details.
   * @return {object} JSON parsed API response.
   */
  getQuestions() {
    return new Promise((resolve, reject) => {
      if(this._questions) {
        resolve(this._questions);
      }
      else {
        const url = apiKey ? `${sgUrl}/${sgSurveyId}/surveyquestion?api_token=${apiKey}` : `${config.baseUrl}:${config.applicationPort}/surveyquestion.json`;

        request(url, (error, response, body) => {
          if(error) {
            reject(error);
          }
          else {
            this._questions = JSON.parse(body).data;
            resolve(this._questions);
          }
        });
      }
    });
  }

  /**
   * Renders data as an object.
   * @returns {object} containing valuable response attributes.
   */
  getData() {
    return this.getQuestions()
      .then(() => this.getResponses())
      .then(data => {
        return data.map((item) => {
          let questions = {};
          Object.keys(item).map(key => {
            let question = this.getQuestion(key);
            if(question && question.title) {
              questions[question.title.English] = item[key];
            }
          });

          return {
            id: item.id,
            submittedAt: new Date(item.datesubmitted),
            questions: questions
          }
        });
      })
  }

  /**
   * Gets question object from given questionQuery.
   * @param {string} questionQuery - SurveyGizmo question key.
   * @returns {object} containing question data.
   */
  getQuestion(questionQuery) {
    if(questionQuery.indexOf('question') === -1) {
      return null;
    }
    else {
      const questionId = parseInt(questionQuery.replace(/[^0-9]/g, ''));
      return this._questions.find(question => question.id === questionId);
    }
  }

  /**
   * Gets particular response data from getData method.
   * @param {number} responseId
   * @returns {object} containing response data.
   */
  getResponse(responseId) {
    return this.getData()
      .then(data => data.find(item => item.id === responseId))
  }
}

module.exports = new SurveyGizmo();
