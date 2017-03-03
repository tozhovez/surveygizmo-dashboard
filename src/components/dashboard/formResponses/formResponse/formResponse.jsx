const React = require('react');

module.exports = class FormResponse extends React.Component {
  render() {
    const {response} = this.props;
    const {questions} = response;
    return (
      <li className="form-responses-item">
        {
          Object.keys(questions).map(q => {
            return <div key={`form-response-question-${response.id}-${q}`}><span className="highlight-text">{`${q}`}</span>{` ${questions[q]}`}</div>
          })
        }

        <div className="actions">
          Actions
          <div>
            <button>Approve</button>
            <button>Reject</button>
          </div>
        </div>
      </li>
    );
  }
}
