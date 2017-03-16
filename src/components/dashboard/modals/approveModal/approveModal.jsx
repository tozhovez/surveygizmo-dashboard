const React = require('react');

module.exports = class ApproveModal extends React.Component {
  constructor() {
    super();

    this.approveResponse = this.approveResponse.bind(this);
    this.close = this.close.bind(this);

    this.state = {
      open: false
    };
  }

  approveResponse() {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this.setState({ approved: true });
        this.close();
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        throw new Error('Approve response failed');
      }
    };

    xhr.open('POST', `/responses/${this.props.responseId}/approve`, true);
    xhr.send();
  }

  close() {
    this.setState({ open: false });
  }

  componentWillUpdate(nextProps) {
    if (!(nextProps === this.props)) {
      this.setState({ open: !!nextProps.responseId });
    }
  }

  render() {
    const { responseId } = this.props;

    return this.state.open && (
      <div className="approve-modal">
        <button className="close-modal" onClick={this.close}>
          Close
        </button>
        <div className="approve-modal-content">
          <h1>Are you sure you want to approve this application? {responseId}</h1>
          <button onClick={this.approveResponse}>Yes</button>
          <button onClick={this.close}>No</button>
          <hr/>
          <br/>
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
