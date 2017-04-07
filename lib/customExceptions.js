function UserDataException(exceptions) {
  this.message = buildUserDataExceptionMessage(exceptions);
  this.name = 'UserDataException';
  Error.captureStackTrace(this, UserDataException);
}
UserDataException.prototype = Object.create(Error.prototype);
UserDataException.prototype.constructor = UserDataException;

const appendIfNotEmpty = (message, messageToAppend) => {
  if (messageToAppend) {
    return `${message}\n ${messageToAppend}`;
  }

  return message;
};

const buildUserDataExceptionMessage = exceptions =>
  Object.keys(exceptions).reduce(
    (message, key) => appendIfNotEmpty(message, exceptions[key][0].user_message),
    ''
  );

module.exports = { UserDataException };
