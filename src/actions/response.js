const dispatcher = require('../dispatcher');
const responseConstants = require('../constants/response');

class ResponseActions {
  loadResponses(pageIndex = 1) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const responses = JSON.parse(xhr.responseText);

        dispatcher.handleAction({
          actionType: responseConstants.SET_RESPONSES,
          data: responses
        });
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        throw new Error('Fetching responses failed');
      }
    };

    xhr.open('GET', `/responses/page/${pageIndex}`, true);
    xhr.send();
  }

  viewResponse(response) {
    dispatcher.handleAction({
      actionType: responseConstants.VIEW_RESPONSE,
      data: response
    });
  }

  approveResponse(response, emailContent) {
    const xhr = new XMLHttpRequest();
    const data = { emailContent };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const surveyResponse = JSON.parse(xhr.responseText);
        dispatcher.handleAction({
          actionType: responseConstants.APPROVE_RESPONSE,
          data: surveyResponse
        });
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        throw new Error('Approve response failed');
      }
    };

    xhr.open('POST', `/responses/${response.id}/approve`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }
}

module.exports = new ResponseActions();
