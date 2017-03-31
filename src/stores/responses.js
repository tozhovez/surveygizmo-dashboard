const { EventEmitter } = require('events');

const dispatcher = require('../dispatcher');
const responseConstants = require('../constants/response');

class ResponsesStore extends EventEmitter {

  constructor() {
    super();
    this.responses = [];
    this.responsesTotalCount = 0;
    this.viewResponse = null;
    this.approveResponse = null;
    this.rejectResponse = null;
  }

  getResponses() {
    return this.responses.map(r => {
      r.statusString = getStatusString(r);
      return r;
    });
  }

  getTotalCount() {
    return this.responsesTotalCount;
  }

  setResponses(responses) {
    this.responses = responses.data;
    this.responsesTotalCount = responses.pageCount;
  }

  getViewResponse() {
    return this.viewResponse;
  }

  setViewResponse(response) {
    this.viewResponse = response;
  }

  approveResponse(approvedResponse) {
    const response = this.responses.find(r => r.id === approvedResponse.id);
    if (response.status) {
      response.status.resetEmailSent = new Date();
    }
    else {
      response.status = {
        resetEmailSent: new Date()
      };
    }
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

// helpers

function getStatusString(response) {
  const { status } = response;

  if (typeof status === 'undefined') {
    return 'Pending';
  }
  else if (status.rejected) {
    return 'Rejected';
  }
  else if (
    status.sentPasswordReset &&
    status.grantedCcxRole &&
    status.accountCreated
  ) {
    return 'Approved';
  }
  return 'Error. Stuck in limbo.';
}

module.exports = responsesStore;
