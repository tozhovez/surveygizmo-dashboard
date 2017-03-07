const React = require('react');
const FormResponse = require('./formResponse/formResponse.jsx');

module.exports = class FormResponses extends React.Component {
  constructor() {
    super();

    this.state = {
      responses: []
    }
  }

  getResponses() {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4 && xhr.status === 200) {
        this.setState({responses: JSON.parse(xhr.responseText)});
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        throw new Error('Fetching responses failed');
      }
    }

    xhr.open('GET', '/responses', true);
    xhr.send();
  }

  componentDidMount() {
    this.getResponses()
  }

  render() {
    return (
      <ul className="form-responses">
        {
          this.state.responses.map(response => {
            return <FormResponse key={`form-response-${response.id}`} response={response} />;
          })
        }
      </ul>
    );
  }
}
