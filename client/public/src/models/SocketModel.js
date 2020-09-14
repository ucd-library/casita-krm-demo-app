const {BaseModel} = require('@ucd-lib/cork-app-utils');
const SocketService = require('../services/SocketService');
const SocketStore = require('../stores/SocketStore');

class SocketModel extends BaseModel {

  constructor() {
    super();

    this.store = SocketStore;
    this.service = SocketService;
    this.service.setModel(this);


    this.register('SocketModel');
  }

  getBoundaryId(data) {
    return data.apid+'-'+data.top+'-'+
            data.left+'-'+data.bottom+'-'+data.right;
  }

}

module.exports = new SocketModel();