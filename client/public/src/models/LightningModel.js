const {BaseModel} = require('@ucd-lib/cork-app-utils');
const service = require('../services/LightningService');

class LightningModel extends BaseModel {

  constructor() {
    super();

    this.service = service;

    this.register('LightningModel');

    this.EventBus.on('socket-message', msg => this.onSocketMessage(msg));
    // this.EventBus.on('app-state-update', e => this._onAppStateUpdate(e));
  }

  async onSocketMessage(msg) {
    if( msg.topic !== 'lightning' ) return;
    msg = msg.message.data;

    if( msg.apid === '301' ) {
      // let summary = await this.service.fetchLightningSummary(msg.files[0]);
      this.EventBus.emit('lightning-avg-update', msg.payload);
    } else if( msg.apid === '302' ) {
      // let e = await this.service.fetchLightningSummary(msg.files[0]);
      this.EventBus.emit('lightning-flash-update', msg.payload);
    }
  }


}

module.exports = new LightningModel();
