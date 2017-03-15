const React = require('react');

module.exports = class FormResponse extends React.Component {
  constructor() {
    super();

    this.state = {
      approved: false
    };
  }

  render() {
    const { response, showApproveModal } = this.props;
    const { questions } = response;

    return (
      <tr className={`form-responses-item ${this.state.approved ? 'approved' : 'not-approved'}`}>
        <td>{questions['Submitter Name']}</td>
        <td>{questions['Submitter Email']}</td>
        <td>{questions.Organization}</td>
        <td>{(new Date(response.submittedAt)).toLocaleDateString()}</td>
        <td>
          <button onClick={() => showApproveModal(response.id)}>Approve</button>
        </td>
      </tr>
    );
  }
}
