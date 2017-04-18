const React = require('react');
const FormResponse = require('./formResponse/formResponse.jsx');

const { array } = React.PropTypes;

const FormResponsesTable = ({ responses }) => (
  <table className="form-responses">
    <thead>
      <tr>
        <td>Name</td>
        <td>Email</td>
        <td>Company Name</td>
        <td>Submitted at</td>
        <td>Status</td>
        <td>Actions</td>
      </tr>
    </thead>
    <tbody>
      {
        responses.map(response =>
          <FormResponse
            key={`form-response-${response.id}`}
            response={response}
            viewResponse={this.viewResponse}
          />
        )
      }
    </tbody>
  </table>);

FormResponsesTable.propTypes = {
  responses: array.isRequired
};

module.exports = FormResponsesTable;
