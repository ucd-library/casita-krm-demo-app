const {BaseModel} = require('@ucd-lib/cork-app-utils');
const ImageService = require('../services/ImageService');
const ImageStore = require('../stores/ImageStore');
const proj4 = require('proj4').default;

class ImageModel extends BaseModel {

  constructor() {
    super();

    proj4.defs('geos', '+proj=geos +x_0=0 +y_0=0 +lon_0=-137 +sweep=x +h=35786023 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');

    this.store = ImageStore;
    this.service = ImageService;
      
    this.register('ImageModel');

    this.EventBus.on('socket-message', msg => this.onSocketMessage(msg));
  }

  async onSocketMessage(msg) {
    if( !msg.subject.match(/\.png$/) ) return;

    let url = new URL(msg.subject);
    let [satellite, scale, date, hour, minsec, band, apid, blockDir, block] = url.pathname.replace(/^\//, '').split('/');

    url = APP_CONFIG.dataServer.url + url.pathname;

    let img = await this.service.loadImage(url);

    let resolution = APP_CONFIG.bandCharacteristics[parseInt(band)].resolution;
    // APP_CONFIG.imageScaleFactor is a factor set on the server, how much it scales the web_scaled images.
    let initImageScale = ((APP_CONFIG.imageScaleFactor * resolution) / 100);

    let [x, y] = block.split('-').map(v => parseInt(v));

    // try {
    // let [lat, lng] = proj4('+proj=geos +h=35786023.0 +a=6378137.0 +f=0.00335281068119356027 +lat_0=0.0 +lon_0=-89.5 +sweep=x', 'EPSG:4326', [x, y]);
    // console.log(lat, lng);
    // } catch(e) {
    //   console.error(e, typeof e);
    // }
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
      block.location.scaled.offset = [x * initImageScale, y * initImageScale];
    }

    if( scale === 'mesoscale' ) {
      let {top, left} = await this.service.getMesoscaleCoord({
        satellite, scale, date, hour, minsec, band, apid
      });

      block.location.original.offset = [left, top];
      block.location.scaled.offset = [left * initImageScale, top * initImageScale];
    }

    this.store.onBlockLoad(block);
  }

  async getLatestFulldisk(band) {

  }

}

module.exports = new ImageModel();