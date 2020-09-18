import MapBlockRenderer from './map-block-renderer'
const {EventBus} = require('@ucd-lib/cork-app-utils');
const apidUtils = require("@ucd-lib/goes-r-packet-decoder/lib/utils/apid");

class BlockStore {

  constructor() {
    this.blocks = {};
  }

  getId(block) {
    return block.apid+'-'+block.location.original.tl[0]+'-'+block.location.original.tl[1]+
      '-'+block.location.original.offset[0]+'-'+block.location.original.offset[1];
  }

  destroy() {
    for( let id in this.blocks ) {
      this.blocks[id].destroy();
    }
    this.blocks = {};
  }

  updateSettings(e) {
    for( let id in this.blocks ) {
      this.blocks[id].updateSettings(e);
    }
  }

  setBlock(block, map) {
    let id = this.getId(block);

    let blockGroup = this.blocks[id];
    if( !blockGroup ) {
      blockGroup = new MapBlockRenderer(map);
      blockGroup.updateSettings(map.appState);
      this.blocks[id] = blockGroup;
    }

    blockGroup.setBlock(block);

    return blockGroup;
  }

  getBlocks(x, y) {
    let blocks = [];
    for( let id in this.blocks ) {
      let blockGroup = this.blocks[id];
      if( blockGroup.top <= y && y <= blockGroup.bottom && 
          blockGroup.left <= x && x <= blockGroup.right ) {
        
        blocks.push(blockGroup);
      }
    }

    return blocks;
  }

  /**
   * @method getDefaultFulldiskOffset
   * @description if the offset is not defined and the imageMode
   * is '*-fulldisk' or 'boundary', calculate offset based on
   * band
   * 
   * @param {*} apid 
   * @param {*} band 
   */
  getDefaultFulldiskOffset(apid, band, topBottom=false) {
    if( this.imageMode !== 'boundary' && !this.imageMode.match(/fulldisk/) ) {
      return 0;
    }

    let {imageScale} = apidUtils.get(apid);
    if( imageScale !== 'conus' ) return 0;

    if( topBottom ) {
      return 1688;
    } else {
      return 5848;
    }
  }

}

export default new BlockStore();