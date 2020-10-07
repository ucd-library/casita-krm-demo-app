const {BaseService} = require('@ucd-lib/cork-app-utils');
const ChannelStatusStore = require('../stores/ChannelStatusStore');

class ChannelStatusService extends BaseService {

  constructor() {
    super();
    this.store = ChannelStatusStore;
  }

  async getChannelStatus() {
    this.store.setChannelStatusLoading();

    let status = {
      1 : await this._getChannelStatus(1),
      2 : await this._getChannelStatus(2)
    }

    this.store.setChannelStatus(status);
  }

  async _getChannelStatus(channel) {
    let resp = await fetch(APP_CONFIG.dataServer.url + '/_/status/channel/' + channel);
    return resp.json();
  }

}

module.exports = new ChannelStatusService();