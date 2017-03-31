const React = require('react');
const responsesStore = require('../../../../stores/responses');
const responseActions = require('../../../../actions/response');

module.exports = class FormResponseDetails extends React.Component {
  render() {
    const response = responsesStore.getViewResponse();
    if (!response) return null;

    const { showApproveModal, showRejectModal } = this.props;
    const { questions } = response;

    return (
      <div className="form-response-details">
        <div className="content">
          <h1>
            {response.statusString}
          </h1>
          {
            Object.keys(questions).map(key =>
              <p key={`view-response-details-${response.id}-${key}`}>
                <b>{key}</b>
                {questions[key]}
              </p>
            )
          }
        </div>
        <button onClick={responseActions.closeViewResponse}>Close</button>
        <button onClick={() => showApproveModal(response)}>Approve</button>
        <button onClick={() => showRejectModal(response)}>Reject</button>
      </div>
    );
  }
}
