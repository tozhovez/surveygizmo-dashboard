const React = require('react');
const FormResponses = require('./formResponses/formResponses.jsx');

module.exports = class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <FormResponses />
      </div>
    )
  }
}
