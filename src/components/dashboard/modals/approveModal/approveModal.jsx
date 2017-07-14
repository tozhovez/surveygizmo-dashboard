/* eslint-disable */
const React = require('react');
const responseActions = require('../../../../actions/response');
const config = require('../../../../../config/main');

module.exports = class ApproveModal extends React.Component {
  constructor() {
    super();

    this.approveResponse = this.approveResponse.bind(this);
    this.close = this.close.bind(this);
    this.updateEmailContent = this.updateEmailContent.bind(this);

    this.state = {
      open: false,
      emailContent: ''
    };
  }

  approveResponse() {
    responseActions.approveResponse(
      this.props.response,
      this.state.emailContent
    );
    this.close();
  }

  close() {
    const { close } = this.props;
    typeof close === 'function' && close();
    this.setState({ open: false });
  }

  updateEmailContent(textarea) {
    this.setState({ emailContent: textarea.value });
  }

  componentWillUpdate(nextProps) {
    if (!(nextProps === this.props)) {
      const name = nextProps.response && `${nextProps.response.questions['Submitter First Name']} ${nextProps.response.questions['Submitter Last Name']}`

      this.setState({
        open: !!nextProps.response,
        emailContent: `We are happy to let you know that we have approved your application to become a Kauffman FastTrac affiliate.

To learn more about the program, and to get started, please log in with the FastTrac account you've already created: ${config.lmsUrl}/login.

If you did not apply to become a FastTrac affiliate, please disregard this email.

Thank you for your participation!

The FastTrac Team`
      });
    }
  }

  render() {
    const { response } = this.props;

    return this.state.open && (
      <div className="approve-modal">
        <button className="close-modal" onClick={this.close}>
          Close
        </button>
        <div className="approve-modal-content">
          <h1>Approve application for {`${response.questions['Submitter First Name']} ${response.questions['Submitter Last Name']}`}?</h1>
          <label htmlFor="">
            The following email will be sent to {response.questions['Submitter Email']}:
          </label>
          <textarea
            rows="6"
            onChange={this.updateEmailContent}
            value={this.state.emailContent}
          />
          <button onClick={this.approveResponse}>Yes</button>
          <button onClick={this.close}>No</button>
          <hr/>
          <br/>
          <p>
            <b>WARNING</b>: Approving this application will
            create a user account for this person and
            grant them CCX Coach role on your course.
          </p>
        </div>
      </div>
    );
  }
};
