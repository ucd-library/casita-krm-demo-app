const {BaseStore} = require('@ucd-lib/cork-app-utils');

class ImageStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      blocks : {}
    };
    this.events = {
      BLOCK_UPDATE : 'block-update'
    };
  }

  onBlockLoad(block) {
    let tl = block.location.original.tl.join('-');
    block = {
      state : this.STATE.LOADED,
      payload: block
    }

    if( !this.data.blocks[block.apid] ) {
      this.data.blocks[block.apid] = {};
    }
    
    this.data.blocks[block.apid][tl] = block;
    this.emit(this.events.BLOCK_UPDATE, block);
  }

}

module.exports = new ImageStore();