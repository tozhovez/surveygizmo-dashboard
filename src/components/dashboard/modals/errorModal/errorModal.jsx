const React = require('react');
const Modal = require('react-modal');
const hasha = require('hasha');
const modalStore = require('../../../../stores/modal');
const { hideErrorModal } = require('../../../../actions/modal');

const { PureComponent } = React;

const hashOptions = { algorithm: 'md5' };
const hash = input => hasha(input, hashOptions);

class ErrorModal extends PureComponent {
  constructor() {
    super();

    this.onStoreChange = this.onStoreChange.bind(this);

    this.state = {
      isOpen: false,
      content: null
    };
  }

  componentDidMount() {
    modalStore.addChangeListener(this.onStoreChange);
  }

  componentWillUnmount() {
    modalStore.removeChangeListener(this.onStoreChange);
  }

  onStoreChange() {
    const { isOpen, content } = modalStore.getErrorModalData();
    this.setState({
      isOpen,
      content
    });
  }

  render() {
    const { isOpen, content } = this.state;
    const messages = content && content.split(/\n/g)
      .map(message => (
        <p key={`message-${hash(message)}`}>
          {message}
        </p>
      ));

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={hideErrorModal}
        contentLabel="Error modal"
        className="error-modal"
      >
        <div className="error-messages">{messages}</div>
      </Modal>
    );
  }
}

module.exports = ErrorModal;
