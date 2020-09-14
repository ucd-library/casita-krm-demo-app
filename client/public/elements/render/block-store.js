import MapBlockRenderer from './map-block-renderer'
const {EventBus} = require('@ucd-lib/cork-app-utils');
const apidUtils = require("@ucd-lib/goes-r-packet-decoder/lib/utils/apid");

class BlockStore {

  constructor() {
    this.blocks = {};
    this.imageMode = 'boundary';

    EventBus.on('app-state-update', e => {
      this.gridModeEnabled = e.gridModeEnabled ? true : false;

      // destroy blocks if mode changes
      if( e.mode !== this.imageMode ) {
        this.imageMode = e.mode;
        this.blocks = {};
      }
    });
  }

  getId(block) {
    return block.apid+'-'+block.location.projected.top+'-'+block.location.projected.left+'-'+
    block.location.projected.bottom+'-'+block.location.projected.right;
  }

  setBlock(block, map) {
    let offsetTop = 0;
    let offsetLeft = 0;
    // let offsetTop = this.getOffset(block.apid, block.band, true);
    // let offsetLeft = this.getOffset(block.apid, block.band);

    let left = block.location.scaled.tl[0];
    let top = block.location.scaled.tl[1];
    let right = block.location.scaled.width + left;
    let bottom = block.location.scaled.height + top;

    block.location.projected = {
      top : this.scale(top, block.band) + offsetTop,
      left : this.scale(left, block.band) + offsetLeft,
      right : this.scale(right, block.band) + offsetLeft,
      bottom : this.scale(bottom, block.band) + offsetTop
    }

    let id = this.getId(block);

    let blockGroup = this.blocks[id];
    if( !blockGroup ) {
      blockGroup = new MapBlockRenderer(
        block,
        this.imageMode, 
        map
      );
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

  scale(val, band) {
    let pxScale = this.getPxScale(band);
    return Math.floor(val * pxScale);
  }

  getPxScale(band) {
    return 1;

    // if( this.imageMode !== 'boundary' && !this.imageMode.match(/fulldisk/) ) {
    //   return 1;
    // }

    // let pxScale = 1;
    // band = parseInt(band || -1);

    // if( band === 1 || band === 3 ) pxScale = 2;
    // else if( band === 5 ) pxScale = 2;
    // else if( 4 <= band && band <= 16 ) pxScale = 4;

    // return pxScale;
  }

  // getOffset(apid, band, topBottom=false) {
  //   apid = apid.toLowerCase();
  //   let position = topBottom ? 0 : 1;

  //   let defaultOffset = this.getDefaultFulldiskOffset(apid, band, topBottom);
  //   if( defaultOffset ) return defaultOffset;

  //   let defs = APP_CONFIG.goesProducts[apid];
  //   if( !defs ) {
  //     return 0;
  //   } else if( !defs[this.imageMode] ) {
  //     return 0;
  //   }

  //   let offset = defs[this.imageMode].projectedCenterOffset || defs[this.imageMode].centerOffset;
  //   return offset[position];
  // }

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