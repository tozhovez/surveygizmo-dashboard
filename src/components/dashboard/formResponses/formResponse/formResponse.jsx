const React = require('react');
const responseActions = require('../../../../actions/response');

const FormResponse = ({ response }) => {
  const { questions } = response;

  return (
    <tr className={`form-responses-item ${response.statusString.toLowerCase()}`}>
      <td>{`${questions['Submitter First Name']} ${questions['Submitter Last Name']}`}</td>
      <td>{questions['Submitter Email']}</td>
      <td>{questions['Organization Name']}</td>
      <td>{(new Date(response.submittedAt)).toLocaleDateString()}</td>
      <td>{response.statusString}</td>
      <td className="no-print">
        <button onClick={() => responseActions.viewResponse(response)}>View</button>
      </td>
    </tr>
  );
};

FormResponse.propTypes = {
  response: React.PropTypes.shape({
    questions: React.PropTypes.object.isRequired
  }).isRequired
};

module.exports = FormResponse;
