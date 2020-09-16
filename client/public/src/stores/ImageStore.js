const {BaseStore} = require('@ucd-lib/cork-app-utils');

class ImageStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      currentBand : -1,
      blocks : {},
      fulldiskImg : null
    };
    this.events = {
      BLOCK_UPDATE : 'block-update',
      FULLDISK_IMAGE_UPDATE : 'filldisk-image-update'
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

  onLatestFulldiskImgLoad(image, band) {
    this.data.fulldiskImg = {image, band};
    this.emit(this.events.FULLDISK_IMAGE_UPDATE, this.data.fulldiskImg);
  }

}

module.exports = new ImageStore();