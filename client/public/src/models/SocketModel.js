const {BaseModel} = require('@ucd-lib/cork-app-utils');
const SocketService = require('../services/SocketService');
const SocketStore = require('../stores/SocketStore');

class SocketModel extends BaseModel {

  constructor() {
    super();

    this.store = SocketStore;
    this.service = SocketService;
    this.service.setModel(this);

    this.EventBus.on('app-state-update', e => this._onAppStateUpdate(e));

    this.register('SocketModel');
  }

  _onAppStateUpdate(e) {
    this.service.setBand(e.band);
    this.service.toggleLightning(e.lightningEnabled);
  }


}

module.exports = new SocketModel();