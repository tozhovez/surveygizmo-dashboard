/* eslint-disable */

const axios = require('axios');
const surveyResponseModel = require('../models/surveyResponse');
const config = require('../config/main');

class SurveyGizmo {
  constructor() {
    this.apiKey = process.env.SG_KEY;
    if (!this.apiKey) throw new Error('Missing SurveyGizmo API key! Export SG_KEY env var.');

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
  getResponses(responseId = null, page = null) {
    const url = this.buildQuery(responseId, page).responsesQuery;
    return axios(url)
    .then(response => ({
       currentPage: response.data.page,
       pageCount: response.data.total_pages,
       totalCount: parseInt(response.data.total_count),
       data: response.data.data
      })
    );
  }

  /**
   * Makes AJAX request to get question details.
   * @return {object} JSON parsed API response.
   */
  getQuestions() {
    const url = this.buildQuery().questionsQuery;
    return new Promise((resolve, reject) => {
      if (this.questions) {
        resolve(this.questions);
      }
      else {
        axios(url)
        .then(response => {
          this.questions = response.data.data;
          resolve(this.questions);
        })
        .catch(error => reject(error));
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
        id: parseInt(item.id),
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
    const questionId = parseInt(questionQuery.replace(/[^0-9]/g, ''));
    return this.questions.find(question => question.id === questionId);
  }

  /**
   * Renders responses data as an object.
   * @returns {object} containing valuable response attributes.
   */
  getResponseData(responseId, page = 1) {
    return this.getQuestions()
      .then(() => this.getResponses(responseId, page))
      .then(({ currentPage, pageCount, totalCount, data }) => {
        if (Array.isArray(data)) {
          return { currentPage, pageCount, totalCount, data: this.tangleQuestionsAndResponses(data) };
        }
        return { data: this.tangleQuestionsAndResponses([data])[0] }
      })
      .then(({ currentPage, pageCount, totalCount, data }) => {
        return this.getDataFromDb()
          .then(dbData => {
            if (Array.isArray(data)) {
              return {
                currentPage,
                pageCount,
                totalCount,
                approvedCount: this.getApprovedCount(dbData),
                rejectedCount: this.getRejectedCount(dbData),
                unprocessedCount: this.getUnprocessedCount(totalCount, dbData),
                data: data.map(response => this.getStatusForResponse(response, dbData))
              };
            }
            return this.getStatusForResponse(data, dbData);
          });
      });
  }

  getApprovedCount(responses = []) {
    return responses
      .filter(response => response.status && !response.status.rejected)
      .length;
  }

  getRejectedCount(responses = []) {
    return responses
      .filter(response => response.status && response.status.rejected)
      .length;
  }

  getUnprocessedCount(total, savedResponses = []) {
    return total - savedResponses.length;
  }

  getStatusForResponse(response, dbData) {
    const data = dbData.find(db => db.responseId === response.id);
    if (data && data.status) {
      response.status = data.status;
    }
    return response;
  }

  getDataFromDb() {
    return new Promise((resolve, reject) => {
      surveyResponseModel.find((err, data) => {
        err ? reject(err) : resolve(data);
      });
    });
  }

  buildQuery(responseId = null, page = null) {
    const url = config.sgUrl;
    const surveyId = config.sgSurveyId;

    return {
      questionsQuery: `${url}/${surveyId}/surveyquestion?api_token=${this.apiKey}`,
      responsesQuery: `${url}/${surveyId}/surveyresponse/${responseId || ''}?api_token=${this.apiKey}&filter[field][1]=status&filter[operator][1]==&filter[value][1]=Complete${page ? `&page=${page}` : ''}`,
    };
  }
}

module.exports = new SurveyGizmo();
