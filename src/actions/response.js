const dispatcher = require('../dispatcher');
const responseConstants = require('../constants/response');

class ResponseActions {
  viewResponse(response) {
    dispatcher.handleAction({
      actionType: responseConstants.VIEW_RESPONSE,
      data: response
    });
  }
}

module.exports = new ResponseActions();
