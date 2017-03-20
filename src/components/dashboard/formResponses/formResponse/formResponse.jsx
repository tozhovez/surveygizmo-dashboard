const React = require('react');

module.exports = class FormResponse extends React.Component {
  constructor() {
    super();

    this.state = {
      approved: false
    };
  }

  approveResponse() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this.setState({ approved: true });
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        throw new Error('Approve response failed');
      }
    }

    xhr.open('POST', `/responses/${this.props.response.id}/approve`, true);
    xhr.send();
  }

  render() {
    const { response, showApproveModal } = this.props;
    const { questions } = response;

    return (
      <tr className={`form-responses-item ${this.state.approved ? 'approved' : 'not-approved'}`}>
        <td>{`${questions['Full name']}`}</td>
        <td>{questions['Submitter Email']}</td>
        <td>{(new Date(response.submittedAt)).toLocaleDateString()}</td>
        <td>{questions.Organization}</td>
        <td>
          <button onClick={() => showApproveModal(response.id)}>Approve</button>
        </td>
      </tr>
    );
  }
}
