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
  }

  getResponses() {
    return this.responses;
  }

  setResponses(responses) {
    this.responses = responses;
  }

  getViewResponse() {
    return this.viewResponse;
  }

  setViewResponse(response) {
    this.viewResponse = response;
  }

  setApproveResponse(response) {
    this.approveResponse = response;
  }

  setRejectResponse(response) {
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
    case responseConstants.SET_RESPONSES:
      responsesStore.setResponses(action.data);
      break;

    case responseConstants.VIEW_RESPONSE:
      responsesStore.setViewResponse(action.data);
      break;

    case responseConstants.APPROVE_RESPONSE:
      responsesStore.setApproveResponse(action.data);
      break;

    case responseConstants.REJECT_RESPONSE:
      responsesStore.setRejectResponse(action.data);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  responsesStore.emitChange();

  return true;
});

module.exports = responsesStore;
