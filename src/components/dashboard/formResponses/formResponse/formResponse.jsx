const React = require('react');

module.exports = class FormResponse extends React.Component {
  constructor() {
    super();

    this.state = {
      approved: false
    }
  }

  approveResponse() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4 && xhr.status === 200) {
        this.setState({approved: true});
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        throw new Error('Approve response failed');
      }
    }

    xhr.open('POST', `/responses/${this.props.response.id}/approve`, true);
    xhr.send();
  }

  render() {
    const { response } = this.props;
    const { questions } = response;

    return (
      <tr className={`form-responses-item ${this.state.approved ? 'approved' : 'not-approved'}`}>
        <td>{`${questions['First Name']} ${questions['Last Name']}`}</td>
        <td>{questions['Email Address']}</td>
        <td>{response.submittedAt}</td>
        <td>{questions['Company Name']}</td>
        <td>
          <button onClick={() => this.approveResponse()}>Approve</button>
        </td>
      </tr>
    );
  }
}
