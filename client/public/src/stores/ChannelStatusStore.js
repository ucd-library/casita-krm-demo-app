const {BaseStore} = require('@ucd-lib/cork-app-utils');

class ChannelStatusStore extends BaseStore {

  constructor() {
    super();

    this.data = {};
    this.events = {
      CHANNEL_STATUS_UPDATE : 'channel-status-update'
    };
  }

  setChannelStatusLoading() {
    this._setState({
      state : this.STATE.LOADING
    });
  }

  setChannelStatus(status) {
    this._setState({
      state : this.STATE.LOADED,
      payload : status
    });
  }

  _setState(state) {
    this.data = state;
    this.emit(this.events.CHANNEL_STATUS_UPDATE, state);
  }

}

module.exports = new ChannelStatusStore();