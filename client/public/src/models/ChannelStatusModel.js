const {BaseModel} = require('@ucd-lib/cork-app-utils');
const ChannelStatusService = require('../services/ChannelStatusService');
const ChannelStatusStore = require('../stores/ChannelStatusStore');

class ChannelStatusModel extends BaseModel {

  constructor() {
    super();

    this.store = ChannelStatusStore;
    this.service = ChannelStatusService;
      
    this.register('ChannelStatusModel');

    setInterval(() => this.getChannelStatus(), 1000 * 60 * 5);
  }

  async getChannelStatus() {
    try {
      await this.service.getChannelStatus();
    } catch(e) {
      console.error(e);
    }

    return this.store.data;
  }

}

module.exports = new ChannelStatusModel();