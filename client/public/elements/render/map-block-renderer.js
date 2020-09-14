const EventEmitter = require('events');
const {EventBus} = require('@ucd-lib/cork-app-utils');

class MapBlockRenderer extends EventEmitter {

  constructor(block, imageMode, map) {
    super(); 

    this.block = block;
    this.bandCharacteristics = APP_CONFIG.bandCharacteristics[block.band];
    this.imageMode = imageMode;

    this.lastUpdated = -1;
    this.map = map;

    this.render = false;

    EventBus.on('app-state-update', e => {
      this.gridModeEnabled = e.gridModeEnabled ? true : false;
    });
  }

  setBlock(block) {
    this.render = true;

    this.blocks = block;
    this.bandCharacteristics = APP_CONFIG.bandCharacteristics[block.band];
    this.lastUpdated = Date.now();

    this.emit('new-image-ready', this);
  }

  getTLBR(scaleFactor=1) {
    let left = (this.block.location.scaled.tl[0] + this.blocks.location.scaled.offset[0]);
    let top = (this.block.location.scaled.tl[1] + this.blocks.location.scaled.offset[1]);
    let right = (this.block.location.scaled.width + left) / scaleFactor;
    let bottom = (this.block.location.scaled.height + top) / scaleFactor;

    top = top/scaleFactor;
    left = left/scaleFactor;

    right += this.map.mapView.offset.x;
    left += this.map.mapView.offset.x;
    top += this.map.mapView.offset.y;
    bottom += this.map.mapView.offset.y;

    return {top, left, bottom, right};
  }

  redraw(context, scaleFactor, now) {
    if( !this.render ) return;

    // if( this.imageMode !== 'boundary' && !this.imageMode.match(/fulldisk/) ) {
    //   if( !this.imageBlock ) return;
    // }

    context.beginPath();

    if( this.selected ) {
      context.strokeStyle = 'red';
      context.lineWidth = 2;
    } else if( now - this.lastUpdated < 3000 ) {
      context.strokeStyle = 'rgba(255, 165, 0)'
      context.lineWidth = 2;
    } else if( this.block.scale ==='conus' ) {
      return
      if( !this.gridModeEnabled ) return;
      context.strokeStyle = '#638e9e'
      context.lineWidth = 1;
    } else {
      return
      if( !this.gridModeEnabled ) return;
      context.strokeStyle = '#ccc'
      context.lineWidth = 1;
    }

    let {top, left, bottom, right} = this.getTLBR(scaleFactor);

    context.rect(
      left, top, 
      (right - left),
      (bottom - top)
    );
    context.stroke();

    if( now - this.lastUpdated > 1000 ) return
    let p = (now - this.lastUpdated) / 1000;

    context.beginPath();
    context.strokeStyle = `rgba(255, 165, 0, ${p < 0.4 ? 0.4 : p})`;
    context.lineWidth = 3;
    context.rect(
      left - ((1-p) * 20), 
      top - ((1-p) * 20), 
      (right - left) + ((1-p) * 40),
      (bottom - top) + ((1-p) * 40)
    );
    context.stroke();
  }

  redrawImg(imgContext, scaleFactor) {
    if( !this.block ) return;
    let {top, left, bottom, right} = this.getTLBR(scaleFactor);
    imgContext.drawImage(this.block.img, left, top, (right - left), (bottom - top));
  }


}

module.exports = MapBlockRenderer;