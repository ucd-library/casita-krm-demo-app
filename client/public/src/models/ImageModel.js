const {BaseModel} = require('@ucd-lib/cork-app-utils');
const ImageService = require('../services/ImageService');
const ImageStore = require('../stores/ImageStore');
const proj4 = require('proj4').default;


const FULLDISK_FUDGE_FACTOR = 18;

class ImageModel extends BaseModel {

  constructor() {
    super();

    proj4.defs('geos', '+proj=geos +x_0=0 +y_0=0 +lon_0=-137 +sweep=x +h=35786023 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');

    this.store = ImageStore;
    this.service = ImageService;
      
    this.register('ImageModel');

    this.EventBus.on('socket-message', msg => this.onSocketMessage(msg));
    this.EventBus.on('app-state-update', e => this._onAppStateUpdate(e));
  }

  async _onAppStateUpdate(e) {
    if( this.store.data.currentBand === e.band ) return;
    this.store.data.currentBand = e.band;

    try {
      await this.service.getLatestFulldisk(e.band);
    } catch(e) {
      console.error('Failed to load latest fulldisk image', e);
    }
  }

  async onSocketMessage(msg) {
    if( !msg.subject.match(/\.png$/) ) return;

    let url = new URL(msg.subject);
    let [satellite, scale, date, hour, minsec, band, apid, blockDir, block] = url.pathname.replace(/^\//, '').split('/');

    url = APP_CONFIG.dataServer.url + url.pathname;

    let img;
    try {
      img = await this.service.loadImage(url);
    } catch(e) {
      console.error('Failed to load image: '+url, e);
      return;
    }

    let resolution = APP_CONFIG.bandCharacteristics[parseInt(band)].resolution;
    // APP_CONFIG.imageScaleFactor is a factor set on the server, how much it scales the web_scaled images.
    let initImageScale = (APP_CONFIG.imageScaleFactor * resolution);

    let [x, y] = block.split('-').map(v => parseInt(v));


    block = {
      satellite,
      scale,
      date,
      time : hour+':'+minsec.replace('-', ':'),
      apid,
      band : parseInt(band),
      location : {
        original : {
          tl : [x, y],
          height : img.height / initImageScale,
          width : img.width / initImageScale,
          offset : [0, 0]
        },
        scaled : {
          tl : [
            x * initImageScale,
            y * initImageScale
          ],
          height : img.height,
          width : img.width,
          offset : [0, 0]
        }
      },
      url,
      img
    }

    if( scale === 'conus' ) {
      let halfFdx = APP_CONFIG.coverage.fulldisk.x/2;
      let halfFdy = APP_CONFIG.coverage.fulldisk.y/2;
      let halfCx = APP_CONFIG.coverage.conus.x/2;
      let halfCy = APP_CONFIG.coverage.conus.y/2;
      
      let spRes = APP_CONFIG.spatialResolutions[resolution];
      let satOffsets = APP_CONFIG.coverage.offsets[block.satellite];

      let x = halfFdx/spRes - halfCx/spRes + satOffsets.conus.x/spRes;
      let y = halfFdy/spRes - halfCy/spRes - satOffsets.conus.y/spRes;

      block.location.original.offset = [x, y];
      block.location.scaled.offset = [x * initImageScale, (y * initImageScale) + FULLDISK_FUDGE_FACTOR];
    }

    if( scale === 'mesoscale' ) {
      let {top, left} = await this.service.getMesoscaleCoord({
        satellite, scale, date, hour, minsec, band, apid
      });

      block.location.original.offset = [left, top];
      block.location.scaled.offset = [left * initImageScale, (top * initImageScale) + FULLDISK_FUDGE_FACTOR];
    }

    this.store.onBlockLoad(block);
  }

}

module.exports = new ImageModel();