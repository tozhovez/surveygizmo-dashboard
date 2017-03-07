const request = require('request');
const apiKey = process.env.SG_KEY;

class SurveyGizmo {
  constructor() {
    this.getQuestion = this.getQuestion.bind(this);
    this.getQuestions = this.getQuestions.bind(this);
    this.getResponses = this.getResponses.bind(this);
    this.renderData = this.renderData.bind(this);
  }
  /**
   * make AJAX request to get people responses
   */
  getResponses() {
    return new Promise((resolve, reject) => {
      var url = apiKey ? `https://restapi.surveygizmo.com/v4/survey/3392617/surveyresponse?api_token=${apiKey}` : 'http://localhost:3001/surveyresponse.json';

      request(url, (error, response, body) => {
        if(error) {
          reject(error);
        }
        else {
          console.log(body);
          resolve(JSON.parse(body).data);
        }
      });
    });
  }

  /**
   * make AJAX request to get question details
   */
  getQuestions() {
    // var self = this;
    return new Promise((resolve, reject) => {
      if(this._questions) {
        resolve(this._questions);
      }
      else {
        console.log('apiKey', apiKey);
        var url = apiKey ? `https://restapi.surveygizmo.com/v4/survey/3392617/surveyquestion?api_token=${apiKey}` : 'http://localhost:3001/surveyquestion.json';

        console.log('URLLL', url);
        request(url, (error, response, body) => {
          console.log(error, body);
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
   * render data into HTML
   */
  renderData() {
    return new Promise((resolve, reject) => {
      this.getQuestions()
        .then(() => {
          return this.getResponses();
        })
        .then(data => {
          resolve(data.map((item) => {
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
          }));
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   *
   * @param {*} questionQuery
   */
  getQuestion(questionQuery) {
    if(questionQuery.indexOf('question') < 0) return null;

    var questionId = parseInt(questionQuery.replace(/[^0-9]/g, ''));

    return this._questions.find(question => { return question.id == questionId});
  }
}

module.exports = new SurveyGizmo();
