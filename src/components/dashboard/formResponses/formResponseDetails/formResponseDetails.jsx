const React = require('react');

module.exports = class FormResponseDetails extends React.Component {
  constructor() {
    super();

    this.state = {
      approved: null
    };
  }

  getStatusString() {
    const { status } = this.props.response;

    if (typeof status === 'undefined') {
      return 'Pending';
    }
    else if (status.rejected) {
      this.setState({ approved: false });
      return 'Rejected';
    }
    else if (
      status.sentPasswordReset &&
      status.grantedCcxRole &&
      status.accountCreated
    ) {
      this.setState({ approved: true });
      return 'Approved';
    }
    else {
      return 'Error. Stuck in limbo.';
    }
  }

  render() {
    if (!this.props.response) return null;

    const { response, showApproveModal, showRejectModal, close } = this.props;
    const { questions } = response;

    return (
      <div className="form-response-details">
        <div className="content">
          <h1>
            {this.getStatusString()}
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
        <button onClick={close}>Close</button>
        <button onClick={() => showApproveModal(response)}>Approve</button>
        <button onClick={() => showRejectModal(response)}>Reject</button>
      </div>
    );
  }
}
