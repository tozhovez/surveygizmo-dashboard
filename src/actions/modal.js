const dispatcher = require('../dispatcher');
const {
  SHOW_ERROR_MODAL,
  HIDE_ERROR_MODAL
} = require('../constants/modal');

class ModalActions {
  showErrorModal(data) {
    dispatcher.handleAction({
      actionType: SHOW_ERROR_MODAL,
      data
    });
  }

  hideErrorModal() {
    dispatcher.handleAction({
      actionType: HIDE_ERROR_MODAL,
      data: null
    });
  }
}

module.exports = new ModalActions();
