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
    const { response, viewResponse, showApproveModal, showRejectModal } = this.props;
    const { questions } = response;

    return (
      <tr className={`form-responses-item ${this.state.approved ? 'approved' : 'not-approved'}`}>
        <td>{`${questions['Full name']}`}</td>
        <td>{questions['Submitter Email']}</td>
        <td>{questions.Organization}</td>
        <td>{(new Date(response.submittedAt)).toLocaleDateString()}</td>
        <td>{this.getStatusString()}</td>
        <td>
          <button onClick={() => viewResponse(response)}>View</button>
        </td>
      </tr>
    );
  }
}
