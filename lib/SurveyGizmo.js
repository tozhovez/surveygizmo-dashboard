const request = require('request');
const config = require('../config/main');

const apiKey = process.env.SG_KEY;
const sgUrl = 'https://restapi.surveygizmo.com/v4/survey';
const sgSurveyId = 3392617;
const sgQueryUrl = `${sgUrl}/${sgSurveyId}/surveyresponse/${responseId || ''}?api_token=${apiKey}&filter[field][1]=status&filter[operator][1]==&filter[value][1]=Complete`;

class SurveyGizmo {
  constructor() {
    this.getQuestion = this.getQuestion.bind(this);
    this.getQuestions = this.getQuestions.bind(this);
    this.getResponses = this.getResponses.bind(this);
    this.getResponseData = this.getResponseData.bind(this);
  }
  /**
   * Makes AJAX request to get people responses.
   * @param {number} responseId - single response ID. Pass this param if you want a single response.
   * @returns {object} JSON parsed API response.
   */
  getResponses(responseId = null) {
    return new Promise((resolve, reject) => {
      const url = apiKey ?
      sgQueryUrl
      :
      `${config.baseUrl}:${config.applicationPort}/surveyresponse.json`;

      request(url, (error, response, body) => {
        if (error) {
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
      if (this._questions) {
        resolve(this._questions);
      }
      else {
        const url = apiKey ? `${sgUrl}/${sgSurveyId}/surveyquestion?api_token=${apiKey}` : `${config.baseUrl}:${config.applicationPort}/surveyquestion.json`;

        request(url, (error, response, body) => {
          if (error) {
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
   * Tangles question data with response data to provide a useful data format.
   * @param {array} responses
   * @returns {array} of objects that have id, submittedAt and questions fields.
   *                  Questions field contains key: value pairs where key is
   *                  SurveyGizmo question title and value is person's response value.
   */
  tangleQuestionsAndResponses(responses) {
    return responses.map((item) => {
      const questions = {};
      Object.keys(item).map(key => {
        const question = this.getQuestion(key);
        if (question && question.title) {
          questions[question.title.English] = item[key];
        }
      });

      return {
        id: item.id,
        submittedAt: new Date(item.datesubmitted),
        questions
      };
    });
  }

  /**
   * Gets question object from given questionQuery.
   * @param {string} questionQuery - SurveyGizmo question key.
   * @returns {object} containing question data.
   */
  getQuestion(questionQuery) {
    if (questionQuery.indexOf('question') === -1) {
      return null;
    }
    else {
      const questionId = parseInt(questionQuery.replace(/[^0-9]/g, ''));
      return this._questions.find(question => question.id === questionId);
    }
  }

  /**
   * Renders responses data as an object.
   * @returns {object} containing valuable response attributes.
   */
  getResponseData(responseId) {
    return this.getQuestions()
      .then(() => this.getResponses(responseId))
      .then(responseData => {
        if (Array.isArray(responseData)) {
          return this.tangleQuestionsAndResponses(responseData);
        }
        else {
          return this.tangleQuestionsAndResponses([responseData])[0];
        }
      });
  }
}

module.exports = new SurveyGizmo();
