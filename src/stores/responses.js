const { EventEmitter } = require('events');

const dispatcher = require('../dispatcher');
const responseConstants = require('../constants/response');

class ResponsesStore extends EventEmitter {

  constructor() {
    super();
    this.responses = [];
    this.responsesTotalCount = 0;
    this.viewResponse = null;
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

  removeViewResponse() {
    this.viewResponse = null;
  }

  setViewResponse(response) {
    this.viewResponse = response;
  }

  setResponseApproved(approvedResponse) {
    const response = this.responses.find(r => r.id == approvedResponse.responseId);
    if (response.status) {
      response.status.sentPasswordReset = Date.now();
    }
    else {
      response.status = {
        sentPasswordReset: Date.now(),
        grantedCcxRole: Date.now(),
        accountCreated: Date.now()
      };
    }
  }

  setResponseRejected(rejectedResponse) {
    const response = this.responses.find(r => r.id == rejectedResponse.responseId);
    if (response.status) {
      response.status.rejected = Date.now();
    }
    else {
      response.status = {
        rejected: Date.now()
      };
    }
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

    case responseConstants.CLOSE_VIEW_RESPONSE:
      responsesStore.removeViewResponse();
      break;

    case responseConstants.APPROVE_RESPONSE:
      responsesStore.setResponseApproved(action.data);
      break;

    case responseConstants.REJECT_RESPONSE:
      responsesStore.setResponseRejected(action.data);
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
