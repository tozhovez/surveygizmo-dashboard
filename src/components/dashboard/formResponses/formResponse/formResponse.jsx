const React = require('react');

module.exports = class FormResponse extends React.Component {
  render() {
    const {response} = this.props;
    return (
      <li>
        {response.id}
      </li>
    );
  }
}
