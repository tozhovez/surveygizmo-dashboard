const React = require('react');

module.exports = class FormResponse extends React.Component {
  constructor() {
    super();

    this.state = {
      approved: false
    }
  }

  approveResponse() {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4 && xhr.status === 200) {
        this.setState({approved: true});
        console.log(xhr.responseText);
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        console.log(xhr.responseText);
        throw new Error('Approve response failed');
      }
    }

    xhr.open('GET', `/responses/${this.props.response.id}/approve`, true);
    xhr.send();
  }

  render() {
    const {response} = this.props;
    const {questions} = response;
    return (
      <li className={`form-responses-item ${this.state.approved ? 'approved' : 'not-approved'}`}>
        {
          Object.keys(questions).map(q => {
            return <div key={`form-response-question-${response.id}-${q}`}><span className="highlight-text">{`${q}`}</span>{` ${questions[q]}`}</div>
          })
        }

        <div className="actions">
          <button onClick={() => this.approveResponse()}>Approve</button>
          <button>Reject</button>
        </div>
      </li>
    );
  }
}
