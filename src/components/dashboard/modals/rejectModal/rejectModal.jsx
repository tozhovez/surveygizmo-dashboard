const React = require('react');
const responseActions = require('../../../../actions/response');

module.exports = class RejectModal extends React.Component {
  constructor() {
    super();

    this.rejectResponse = this.rejectResponse.bind(this);
    this.close = this.close.bind(this);
    this.updateEmailContent = this.updateEmailContent.bind(this);

    this.state = {
      open: false,
      emailContent: ''
    };
  }

  rejectResponse() {
    responseActions.rejectResponse(
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
      this.setState({
        open: !!nextProps.response,
        emailContent: `Dear ${nextProps.response && nextProps.response.questions['Full name']},
we have rejected your account.`
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
          <h1>Reject application for {response.questions['Full name']}?</h1>
          <label htmlFor="">
            The following email will be sent to {response.questions['Submitter Email']}:
          </label>
          <textarea
            rows="6"
            onChange={this.updateEmailContent}
            value={this.state.emailContent}
          />
          <button onClick={this.rejectResponse}>Yes</button>
          <button onClick={this.close}>No</button>
        </div>
      </div>
    );
  }
};
