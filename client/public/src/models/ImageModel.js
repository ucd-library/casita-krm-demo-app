const {BaseModel} = require('@ucd-lib/cork-app-utils');
const ImageService = require('../services/ImageService');
const ImageStore = require('../stores/ImageStore');
// const proj4 = require('proj4').default;


const FULLDISK_FUDGE_FACTOR = 18;

class ImageModel extends BaseModel {

  constructor() {
    super();

    // proj4.defs('geos', '+proj=geos +x_0=0 +y_0=0 +lon_0=-137 +sweep=x +h=35786023 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');

    this.store = ImageStore;
    this.service = ImageService;
      
    this.register('ImageModel');

    this.hiRes = false;

    this.EventBus.on('socket-message', msg => this.onSocketMessage(msg));
    this.EventBus.on('app-state-update', e => this._onAppStateUpdate(e));
  }

  setHiRes(hiRes) {
    this.hiRes = hiRes;
  }

  async _onAppStateUpdate(e) {
    this.imageMode = e.imageMode || 'imagery';

    if( this.store.data.currentBand === e.band ) return;
    this.store.data.currentBand = e.band;

    try {
      await this.service.getLatestFulldisk(e.band);
    } catch(e) {
      console.error('Failed to load latest fulldisk image', e);
    }
  }

  async onSocketMessage(msg) {
    if( msg.topic !== 'block-composite-image' ) return;
    msg = msg.message;

    // APP_CONFIG.imageScaleFactor is a factor set on the server, how much it scales the web_scaled images.
    let imageRe = /\/web-scaled.png$/;
    let scaleFactor = APP_CONFIG.imageScaleFactor;
    let resolution = APP_CONFIG.bandCharacteristics[parseInt(msg.data.band)].resolution;

    if( this.hiRes ) {
      scaleFactor = resolution;
      imageRe = /\/web.png$/;
    }

    let file = msg.data.files.find(file => file.match(imageRe));
    let url = APP_CONFIG.dataServer.url + file;
    let initImageScale = (scaleFactor / resolution);

    let img = null;
    if( this.imageMode === 'imagery' ) {
      try {
        img = await this.service.loadImage(url);
      } catch(e) {
        console.error('Failed to load image: '+url, e);
      }
    } else {
      img = await this.service.getBlockHeighWidth(parseUrl.pathname);
      img.width = img.width * initImageScale;
      img.height = img.height * initImageScale;
    }

    let datetime = new Date(msg.data.datetime);
    // datetime = new Date(datetime.getTime() - (new Date().getTimezoneOffset()*60*1000))
    this.store.setLatestCaptureTime(msg.data.product, datetime, Date.now() - datetime.getTime());

    // let [x, y] = block.split('-').map(v => parseInt(v));
    // console.log('scale factor='+APP_CONFIG.imageScaleFactor, 'resolution='+resolution, 'initImageScale='+initImageScale);

    // if( resolution === 1 ) resolution = 2;
    let x = msg.data.x;
    let y = msg.data.y;

    let block = {
      satellite : msg.data.satellite,
      scale : msg.data.product,
      date : msg.data.date,
      time : msg.data.hour+':'+msg.data.minsec.replace('-', ':'),
      apid : msg.data.apid,
      band : parseInt(msg.data.band),
      location : {
        original : {
          tl : [x, y],
          height : img.height / initImageScale,
          width : img.width / initImageScale,
          offset : [0, 0]
        },
        // scaled : {
        //   tl : [
        //     x,
        //     y
        //   ],
        //   height : img.height * initImageScale,
        //   width : img.width * initImageScale,
        //   offset : [0, 0]
        // },
        scaled : {
          tl : [
            msg.data.x * resolution,
            msg.data.y * resolution
          ],
          height : img.height * scaleFactor,
          width : img.width * scaleFactor,
          offset : [0, 0]
        }
      },
      url,
      img
    }

    if( msg.data.product === 'conus' ) {
      let halfFdx = APP_CONFIG.coverage.fulldisk.x/2;
      let halfFdy = APP_CONFIG.coverage.fulldisk.y/2;
      let halfCx = APP_CONFIG.coverage.conus.x/2;
      let halfCy = APP_CONFIG.coverage.conus.y/2;
      
      let spRes = APP_CONFIG.spatialResolutions[resolution];
      let satOffsets = APP_CONFIG.coverage.offsets[block.satellite];

      let x = halfFdx/spRes - halfCx/spRes + satOffsets.conus.x/spRes;
      let y = halfFdy/spRes - halfCy/spRes - satOffsets.conus.y/spRes;

      block.location.original.offset = [x, y];
      // block.location.scaled.offset = [x * initImageScale, (y * initImageScale) + FULLDISK_FUDGE_FACTOR];
      block.location.scaled.offset = [x * resolution, (y * resolution) + FULLDISK_FUDGE_FACTOR];
    }

    if( msg.data.product === 'mesoscale' ) {
      let {error, top, left} = await this.service.getMesoscaleCoord(msg.data);
      if( error ) return;

      block.location.original.offset = [left, top];
      // block.location.scaled.offset = [left * initImageScale, (top * initImageScale) + FULLDISK_FUDGE_FACTOR];
      block.location.scaled.offset = [left * resolution, (top * resolution) + FULLDISK_FUDGE_FACTOR];
    }

    this.store.onBlockLoad(block);
  }

  getHistogram() {
    return this.store.data.histogram;
  }

  setHistogramData(data, min, max) {
    this.store.setHistogramData(data, min, max);
  }

  setHistogramMinMax(min, max) {
    this.store.setHistogramMinMax(min, max);
  }

  setHistogramAbsMinMax(min, max) {
    this.store.setHistogramAbsMinMax(min, max);
  }

  async getProductStatus() {
    let cached = this.store.data.productStatus;

    try {
      if( cached.request ) {
        await cached.request;
      } else {
        await this.service.loadProductStatus();
      }
    } catch(e) {
      console.error(e);
    }

    return this.store.data.productStatus;
  }

}

module.exports = new ImageModel();