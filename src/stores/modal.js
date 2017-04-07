const { EventEmitter } = require('events');
const dispatcher = require('../dispatcher');
const {
  SHOW_ERROR_MODAL,
  HIDE_ERROR_MODAL
} = require('../constants/modal');

class ModalStore extends EventEmitter {
  constructor() {
    super();

    this.errorModalData = {
      isOpen: false,
      content: null
    };
  }

  getErrorModalData() {
    return this.errorModalData;
  }

  showErrorModal({ content }) {
    this.errorModalData = {
      isOpen: true,
      content
    };
  }

  hideErrorModal() {
    this.errorModalData = {
      isOpen: false,
      content: null
    };
  }

  emitChange() {
    this.emit('change');
  }

  addChangeListener(callback) {
    this.on('change', callback);
  }

  removeChangeListener(callback) {
    this.removeListener('change', callback);
  }
}

const modalStore = new ModalStore();

dispatcher.register(payload => {
  const action = payload.action;

  if (typeof action.actionType === 'undefined') {
    throw new Error('Undefined action constant!');
  }

  switch (action.actionType) {
    case SHOW_ERROR_MODAL:
      modalStore.showErrorModal(action.data);
      break;
    case HIDE_ERROR_MODAL:
      modalStore.hideErrorModal();
      break;

    default:
      return true;
  }

  modalStore.emitChange();

  return true;
});

module.exports = modalStore;
