const React = require('react');

module.exports = class FormResponse extends React.Component {
  constructor() {
    super();

    this.state = {
      approved: false
    };
  }

  getStatusString() {
    const { status } = this.props.response;

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
    else {
      return 'Error. Stuck in limbo.';
    }
  }

  render() {
    const { response, showApproveModal, showRejectModal } = this.props;
    const { questions } = response;

    return (
      <tr className={`form-responses-item ${this.state.approved ? 'approved' : 'not-approved'}`}>
        <td>{`${questions['Full name']}`}</td>
        <td>{questions['Submitter Email']}</td>
        <td>{questions.Organization}</td>
        <td>{(new Date(response.submittedAt)).toLocaleDateString()}</td>
        <td>{this.getStatusString()}</td>
        <td>
          <button onClick={() => showApproveModal(response)}>Approve</button>
          <button onClick={() => showRejectModal(response)}>Reject</button>
        </td>
      </tr>
    );
  }
}
