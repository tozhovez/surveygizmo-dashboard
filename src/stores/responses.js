const { EventEmitter } = require('events');

const dispatcher = require('../dispatcher');
const responseConstants = require('../constants/response');

class ResponsesStore extends EventEmitter {

  constructor() {
    super();
    this.responses = [];
    this.viewResponse = null;
    this.approveResponse = null;
    this.rejectResponse = null;
    this.loadResponses();
  }

  loadResponses() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this.responses = JSON.parse(xhr.responseText);
        this.emitChange();
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        throw new Error('Fetching responses failed');
      }
    };

    xhr.open('GET', '/responses', true);
    xhr.send();
  }

  getResponses() {
    return this.responses;
  }

  getViewResponse() {
    return this.viewResponse;
  }

  setViewResponse(response) {
    this.viewResponse = response;
  }

  approveResponse(response) {
    this.approveResponse = response;
  }

  rejectResponse(response) {
    this.rejectResponse = response;
  }

  // generic store stuff

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

// action handling

const responsesStore = new ResponsesStore();

dispatcher.register(payload => {
  const action = payload.action;

  if (typeof action.actionType === 'undefined') {
    throw new Error('Undefined action constant!');
  }

  switch (action.actionType) {
    case responseConstants.VIEW_RESPONSE:
      responsesStore.setViewResponse(action.data);
      break;

    case responseConstants.APPROVE_RESPONSE:
      responsesStore.approveResponse(action.data);
      break;

    case responseConstants.REJECT_RESPONSE:
      responsesStore.rejectResponse(action.data);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  responsesStore.emitChange();

  return true;
});

module.exports = responsesStore;
