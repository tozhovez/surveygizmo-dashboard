const React = require('react');
const responseActions = require('../../../../actions/response');

const FormResponse = ({ response }) => {
  const { questions } = response;

  return (
    <tr className={`form-responses-item ${response.statusString.toLowerCase()}`}>
      <td>{`${questions['Full name']}`}</td>
      <td>{questions['Submitter Email']}</td>
      <td>{questions.Organization}</td>
      <td>{(new Date(response.submittedAt)).toLocaleDateString()}</td>
      <td>{response.statusString}</td>
      <td>
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
