const {BaseService} = require('@ucd-lib/cork-app-utils');

class LightningService extends BaseService {


  async fetchLightningSummary(path) {
    let resp = await fetch(APP_CONFIG.dataServer.url + path);
    return resp.json();
  }


}

module.exports = new LightningService();