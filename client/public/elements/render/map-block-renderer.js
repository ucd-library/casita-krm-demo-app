const EventEmitter = require('events');
const {EventBus} = require('@ucd-lib/cork-app-utils');

class MapBlockRenderer extends EventEmitter {

  constructor(map) {
    super(); 

    this.debug = true;
    this.lastUpdated = -1;
    this.map = map;

    this.canvas = document.createElement('canvas');
    this.map.shadowRoot.querySelector('#rasterCanvasBlocks').appendChild(this.canvas);
    this.canvasCtx = this.canvas.getContext('2d');

    this.render = false;
  }

  updateSettings(opts) {
    this.gridModeEnabled = opts.gridModeEnabled ? true : false;
  }

  destroy() {
    this.map.shadowRoot.querySelector('#rasterCanvasBlocks').removeChild(this.canvas);
  }

  setBlock(block) {
    this.render = true;

    this.block = block;
    this.bandCharacteristics = APP_CONFIG.bandCharacteristics[block.band];
    this.lastUpdated = Date.now();

    // initialize the canvas
    this.canvas.width = block.img.width;
    this.canvas.height = block.img.height;
    this.canvasCtx.clearRect(0, 0, block.img.width, block.img.height);
    this.canvasCtx.drawImage(block.img, 0, 0, block.img.width, block.img.height);

    // initialize the 'balanced raster' so we have one
    this.canvasImgData = this.canvasCtx.getImageData(0, 0, block.img.width, block.img.height);

    let sampled = new Uint8ClampedArray(this.canvasImgData.data.length/4);
    for( let i = 0; i < this.canvasImgData.data.length; i += 4 ) {
      sampled[i/4] = this.canvasImgData.data[i];
    }
    this.canvasImgData = {
      data:sampled,
      width : this.canvasImgData.width,
      height : this.canvasImgData.height
    };

    // this.balancedImgData = this.canvasImgData;
  }


  setBalancedData(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let rgba = new Uint8ClampedArray(data.width * data.height * 4);
        for( let i = 0; i < data.data.length; i++ ) {
          rgba[i*4] = data.data[i];
          rgba[(i*4)+1] = data.data[i];
          rgba[(i*4)+2] = data.data[i];
          rgba[(i*4)+3] = 255;
        }
        this.canvasCtx.putImageData(new ImageData(rgba, data.width, data.height), 0, 0);
        resolve();
      },0);
    });
  }

  getTLBR() {
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

  redraw(context, now) {
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

    let {top, left, bottom, right} = this.getTLBR();

    context.rect(
      left, top, 
      (right - left),
      (bottom - top)
    );
    context.stroke();

    if( this.debug ) {

      context.font = "10px Arial";
      context.fillText(this.block.scale, left+5, top+10);
      // context.fillText(left+', '+top, left+5, top+25);
      context.fillText(this.block.location.original.tl[0]+', '+this.block.location.original.tl[1], left+5, top+25);
    }

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

  redrawImg(imgContext) {
    let {top, left, bottom, right} = this.getTLBR();
    imgContext.drawImage(this.canvas, left, top, (right - left), (bottom - top));
  }


}

module.exports = MapBlockRenderer;