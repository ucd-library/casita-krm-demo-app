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
    if( !msg.subject.match(/\/(301\/stats.json|302\/payload\.json)$/) ) return;

    let parseUrl = new URL(msg.subject);
    let [satellite, scale, date, hour, minsec, ms, apid, file] = parseUrl.pathname.replace(/^\//, '').split('/');

    if( apid === '301' ) {
      let summary = await this.service.fetchLightningSummary(parseUrl.pathname);
      this.EventBus.emit('lightning-avg-update', summary);
    } else if( apid === '302' ) {
      let e = await this.service.fetchLightningSummary(parseUrl.pathname);
      this.EventBus.emit('lightning-flash-update', e);
    }
  }


}

module.exports = new LightningModel();
