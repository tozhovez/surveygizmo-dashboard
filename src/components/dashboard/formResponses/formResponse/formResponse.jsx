const React = require('react');
const responseActions = require('../../../../actions/response');

class FormResponse extends React.PureComponent {
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
      // this.setState({ approved: false });
      return 'Rejected';
    }
    else if (
      status.sentPasswordReset &&
      status.grantedCcxRole &&
      status.accountCreated
    ) {
      // this.setState({ approved: true });
      return 'Approved';
    }
    return 'Error. Stuck in limbo.';
  }

  render() {
    const { response } = this.props;
    const { questions } = response;

    return (
      <tr className={`form-responses-item ${this.state.approved ? 'approved' : 'not-approved'}`}>
        <td>{`${questions['Full name']}`}</td>
        <td>{questions['Submitter Email']}</td>
        <td>{questions.Organization}</td>
        <td>{(new Date(response.submittedAt)).toLocaleDateString()}</td>
        <td>{this.getStatusString()}</td>
        <td>
          <button onClick={() => responseActions.viewResponse(response)}>View</button>
        </td>
      </tr>
    );
  }
}

FormResponse.propTypes = {
  response: React.PropTypes.object.isRequired, // eslint-disable-line
  viewResponse: React.PropTypes.func.isRequired
};

module.exports = FormResponse;
