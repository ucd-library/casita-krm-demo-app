const {BaseService} = require('@ucd-lib/cork-app-utils');
const ImageStore = require('../stores/ImageStore');

class ImageService extends BaseService {

  constructor() {
    super();
    this.store = ImageStore;
    this.xmlParser = new DOMParser();
  }

  loadImage(url) {
    let img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";

    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = e => reject(err);
    });
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
    let coverage = 0.302701402/2;
    var {coords, scaleFactor} = this._getCoordsFromMeta(xmlDoc, 'x');
    let left = coords[0] + (coverage / scaleFactor);

    var {coords, scaleFactor} = this._getCoordsFromMeta(xmlDoc, 'y');
    let top = (coverage / scaleFactor) - coords[0];

    return {top, left, scaleFactor};
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

  listImages() {

  }

}

module.exports = new ImageService();