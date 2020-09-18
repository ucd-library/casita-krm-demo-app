const {BaseService} = require('@ucd-lib/cork-app-utils');
const ImageStore = require('../stores/ImageStore');

class ImageService extends BaseService {

  constructor() {
    super();
    this.store = ImageStore;
    this.xmlParser = new DOMParser();
    this.MAX_FULLDISK_ATTEMPTS = 10;
  }

  loadImage(url) {
    let img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";

    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = e => reject(e);
    });
  }

  async getBlockHeighWidth(imgPath) {
    imgPath = imgPath.split('/');
    imgPath.pop();

    let resp = await fetch(APP_CONFIG.dataServer.url + imgPath.join('/') + '/fragment-metadata.json');
    let metadata = await resp.json();

    return {
      width: metadata['fragment_headers_0'].imagePayload.IMAGE_BLOCK_WIDTH,
      height: metadata['fragment_headers_0'].imagePayload.IMAGE_BLOCK_HEIGHT
    }
  }

  async getMesoscaleCoord(args) {
    if( args.apid[0] == 'd' ) {
      args.apid = 'c'+(parseInt(args.band) - 1);
    } else if( args.apid[0] == 'f' ) {
      args.apid = 'e'+(parseInt(args.band) - 1);
    } else {
      throw new Error('Unknown apid to fetch metadata: '+args.apid);
    }
    

    let resp = await fetch(APP_CONFIG.dataServer.url + '/' +
      args.satellite + '/' +
      args.scale + '/' +
      args.date + '/' +
      args.hour + '/' +
      args.minsec + '/' +
      args.apid + '/payload.bin'
    );
    let xml = await resp.text();
    let xmlDoc = this.xmlParser.parseFromString(xml,"text/xml");
  
    // TODO: x and y coverage vary.
    try {
      var {coords, scaleFactor} = this._getCoordsFromMeta(xmlDoc, 'x');
      let left = coords[0] + ((APP_CONFIG.coverage.fulldisk.x/2) / scaleFactor);

      var {coords, scaleFactor} = this._getCoordsFromMeta(xmlDoc, 'y');
      let top = ((APP_CONFIG.coverage.fulldisk.y/2) / scaleFactor) - coords[0];

      return {top, left, scaleFactor};
    } catch(e) {
      console.error('Failed to get coverage', e);
    }
    return {error: true}
  }

  _getCoordsFromMeta(xmlDoc, varname) {
    let node = xmlDoc.querySelector(`variable[name="${varname}"]`);
    let scaleFactor = Math.abs(parseFloat(
      node.querySelector('[name="scale_factor"]').getAttribute('value')
    ));
    node = xmlDoc.querySelector(`variable[name="${varname}_image_bounds"]`);
    return {
      coords: node.querySelector('values')
      .innerHTML
      .split(' ')
      .map(v => (parseFloat(v) / scaleFactor)),
      scaleFactor
    }
  }

  async ls(dir) {
    let resp = await fetch(
      APP_CONFIG.dataServer.url + '/' + dir.replace(/^\//, ''),
      {
        headers : {accept : 'application/json'}
      }
    );
    return resp.json();
  }


  async getLatestFulldisk(band) {
    return ;

    let dir = '/west/fulldisk';

    let dates = (await this.ls(dir)).map(v => {return {date: v, time : new Date(v).getTime()}})
    dates.sort((a, b) => a.time < b.time ? 1 : -1);

    let latestUrl = await this._getHour(dir + '/' + dates[0].date, band);
    if( latestUrl === false && dates.length > 1) {
      latestUrl = await this._getHour(dir + '/' + dates[1].date, band);
    }

    if( latestUrl === false || latestUrl.failure ) {
      return console.error('failed to load background full disk image for band: '+band);
    }

    let bgImg = await this.loadImage(APP_CONFIG.dataServer.url +latestUrl.success);

    // the band has updated
    if( band !== this.store.data.currentBand ) return;
    this.store.onLatestFulldiskImgLoad(bgImg);
  }

  async _getHour(dir, band) {
    let hour = (await this.ls(dir)).map(v => {return {asInt: parseInt(v), hour : v}})
    hour.sort((a, b) => a.asInt < b.asInt ? 1 : -1);

    // try current hour
    let currentHourDir = await this._getMinSec(dir + '/' + hour[0].hour, band);
    if( currentHourDir ) return {success: currentHourDir};

    // try prior hour
    if( hour.length > 1 ) {
      let priorHourDir = await this._getMinSec(dir + '/' + hour[1].hour, band);
      if( priorHourDir ) return {success: priorHourDir};
      return {failure: true}
    }

    // the prior hour is a prior day
    return false;
  }

  async _getMinSec(dir, band) {
    let minsec = (await this.ls(dir)).map(v => {return {asInt: parseInt(v.replace('-', '')), minsec : v}})
    minsec.sort((a, b) => a.asInt < b.asInt ? 1 : -1);

    if( minsec.length <= 1 ) return false;

    dir = dir + '/' + minsec[0].minsec + '/' + band;
    let apids = await this.ls(dir);
    dir = dir + '/' + apids[0];

    let files = await this.ls(dir);
    if( files.includes('web_scaled.png') ) {
      return dir+'/web_scaled.png';
    }
    return false;
  }

}

module.exports = new ImageService();