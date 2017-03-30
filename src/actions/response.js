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
}

module.exports = new ResponseActions();
