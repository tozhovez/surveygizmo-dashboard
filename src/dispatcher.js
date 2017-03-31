const { Dispatcher } = require('flux');

class AppDispatcher extends Dispatcher {
  handleAction(action) {
    if (this.isDispatching()) {
      window.setTimeout(() => {
        this.dispatch({
          source: 'VIEW_ACTION',
          action
        });
      });
    } else {
      this.dispatch({
        source: 'VIEW_ACTION',
        action
      });
    }
  }
}

module.exports = new AppDispatcher();
