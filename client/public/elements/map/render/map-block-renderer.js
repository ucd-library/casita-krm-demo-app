const EventEmitter = require('events');
const {EventBus} = require('@ucd-lib/cork-app-utils');

const COLOR_BALANCE_SAMPLE_RATE = 16;

class MapBlockRenderer extends EventEmitter {

  constructor(map) {
    super(); 

    this.gridModeEnabled = false;
    this.labelModeEnabled = false;

    this.lastUpdated = -1;
    this.map = map;

    this.canvas = document.createElement('canvas');
    this.map.shadowRoot.querySelector('#rasterCanvasBlocks').appendChild(this.canvas);
    this.canvasCtx = this.canvas.getContext('2d');

    this.render = false;
    this.fit = {};
  }

  updateSettings(opts) {
    this.gridModeEnabled = opts.gridModeEnabled ? true : false;
    this.labelModeEnabled = opts.labelModeEnabled ? true : false;
  }

  destroy() {
    this.map.shadowRoot.querySelector('#rasterCanvasBlocks').removeChild(this.canvas);
  }

  fitData(val, min, max) {
    if( val < min ) val = min;
    else if ( val > max ) val = max;
  
    val = val - min;
  
    return Math.round( ( val / (max-min)) * 255);
  }

  setBlock(block) {
    this.render = true;
    this.fit = {};

    this.block = block;
    this.bandCharacteristics = APP_CONFIG.bandCharacteristics[block.band];
    this.lastUpdated = Date.now();

    // initialize the canvas
    this.canvas.width = block.img.width;
    this.canvas.height = block.img.height;
    this.canvasCtx.clearRect(0, 0, block.img.width, block.img.height);
    
    // initialize the 'balanced raster' so we have one
    this.canvasCtx.drawImage(block.img, 0, 0, block.img.width, block.img.height);

    // grab the unbalanced data for (re)balancing later on
    this.canvasImgData = this.canvasCtx.getImageData(0, 0, block.img.width, block.img.height);

    // sample the real raster for image blancing
    let samplingRate = (4*COLOR_BALANCE_SAMPLE_RATE);
    this.sampledImgData = new Uint8ClampedArray(this.canvasImgData.data.length/samplingRate);
    for( let i = 0; i < this.canvasImgData.data.length; i += samplingRate) {
      this.sampledImgData[i/samplingRate] = this.canvasImgData.data[i];
    }
  }

  setBalancedData(min, max, imgContext) {
    if( this.fit.min === min && this.fit.max === max ) return false;
    this.fit = {min, max};

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let rgba = new Uint8ClampedArray(this.canvasImgData.data.length);
        let v;

        for( let i = 0; i < this.canvasImgData.data.length; i += 4) {
          v = this.fitData(this.canvasImgData.data[i], min, max);
          rgba[i] = v
          rgba[i+1] = v;
          rgba[i+2] = v;
          rgba[i+3] = 255;
        }

        this.canvasCtx.putImageData(new ImageData(rgba, this.canvasImgData.width, this.canvasImgData.height), 0, 0);
        if( imgContext ) this.redrawImg(imgContext);

        resolve();
      },0);
    });
  }

  /**
   * @method getBounds
   * @description get the bounds of the image, in screen coordinates, given the current map 
   * state and product definition
   */
  getBounds() {
    let left = (this.block.location.scaled.tl[0] + this.block.location.scaled.offset[0]);
    let top = (this.block.location.scaled.tl[1] + this.block.location.scaled.offset[1]);
    let right = (this.block.location.scaled.width + left) / this.map.mapView.zoom;
    let bottom = (this.block.location.scaled.height + top) / this.map.mapView.zoom;

    top = top / this.map.mapView.zoom;
    left = left / this.map.mapView.zoom;

    right += this.map.mapView.offset.x
    left += this.map.mapView.offset.x;
    top += this.map.mapView.offset.y;
    bottom += this.map.mapView.offset.y;

    return {
      top : Math.floor(top), 
      left : Math.floor(left), 
      bottom: Math.floor(bottom), 
      right: Math.floor(right)
    };
  }

  /**
   * @method redraw
   * @description redraw the image vector information.  This is the image block boundary,
   * image block label and image block animation
   * 
   * @param {Object} context canvas 2d context
   * @param {Number} now ms timestamp
   */
  redraw(context, now) {
    context.beginPath();

    if( this.selected ) {
      context.strokeStyle = 'red';
      context.lineWidth = 2;
    } else if( now - this.lastUpdated < 3000 ) {
      context.strokeStyle = 'rgba(255, 165, 0)'
      context.fillStyle = 'rgba(255, 165, 0)'
      context.lineWidth = 2;
    } else if( this.block.scale ==='conus' ) {
      context.strokeStyle = 'yellow'
      context.fillStyle = 'yellow'
      context.lineWidth = 1;
    } else if( this.block.scale ==='mesoscale' ) {
      context.strokeStyle = 'red'
      context.fillStyle = 'red'
      context.lineWidth = 1;
    } else {
      context.strokeStyle = 'green'
      context.fillStyle = 'green'
      context.lineWidth = 1;
    }

    let {top, left, bottom, right} = this.getBounds();

    if( this.gridModeEnabled ) {
      context.rect(
        left, top, 
        (right - left),
        (bottom - top)
      );
      context.stroke();

      if( this.labelModeEnabled ) {
        context.font = "10px Arial";
        context.fillText(this.block.scale+': '+this.block.apid, left+5, top+10);
        context.fillText(this.block.location.original.tl[0]+', '+this.block.location.original.tl[1], left+5, top+25);
      }
    }

    if( now - this.lastUpdated > 3000 ) return
    let p = (now - this.lastUpdated) / 1000;
    if( p > 1 ) p = 1;

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

  /**
   * @method redrawImg
   * @description redraw the image raster
   * 
   * @param {*} imgContext canvas 2d context
   */
  redrawImg(imgContext) {
    let {top, left, bottom, right} = this.getBounds();

    imgContext.clearRect(left, top, (right - left), (bottom - top));
    imgContext.drawImage(this.canvas, left, top, (right - left), (bottom - top));
  }


}

module.exports = MapBlockRenderer;