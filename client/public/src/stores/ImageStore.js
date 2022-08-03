const {BaseStore} = require('@ucd-lib/cork-app-utils');

class ImageStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      latestCaptureTime : {},
      currentBand : -1,
      blocks : {},
      fulldiskImg : null,
      histogram : {
        data : {},
        min : 5,
        max : 190,
        absMin : 5,
        absMax : 190
      },
      mesoscaleMetaCache : []
    };
    this.events = {
      BLOCK_UPDATE : 'block-update',
      FULLDISK_IMAGE_UPDATE : 'filldisk-image-update',
      LATEST_CAPTURE_TIME_UPDATE : 'latest-image-capture-time-update',
      HISTOGRAM_UPDATE : 'image-histogram-update'
    };
  }

  setHistogramAbsMinMax(min, max) {
    this.data.histogram.absMin = min;
    this.data.histogram.absMax = max;
    this.emit(this.events.HISTOGRAM_UPDATE, this.data.histogram);
  }

  setHistogramMinMax(min, max) {
    this.data.histogram.min = min;
    this.data.histogram.max = max;
    this.emit(this.events.HISTOGRAM_UPDATE, this.data.histogram);
  }

  setHistogramData(data, min, max) {
    this.data.histogram.data = data;
    if( min !== undefined ) this.data.histogram.min = min;
    if( max !== undefined ) this.data.histogram.max = max;
    this.emit(this.events.HISTOGRAM_UPDATE, this.data.histogram);
  }

  setLatestCaptureTime(product, date, ttd) {
    // if( this.data.latestCaptureTime.date  && 
    //   date.getTime() < this.data.latestCaptureTime.date.getTime() ) {
    //   return;
    // }
    this.data.latestCaptureTime = {product, date, ttd};
    this.emit(this.events.LATEST_CAPTURE_TIME_UPDATE, this.data.latestCaptureTime);
  }

  onBlockLoad(block) {
    let tl = block.location.original.tl.join('-');
    block = {
      state : this.STATE.LOADED,
      payload: block
    }

    if( !this.data.blocks[block.apid] ) {
      this.data.blocks[block.apid] = {};
    }
    
    this.data.blocks[block.apid][tl] = block;
    this.emit(this.events.BLOCK_UPDATE, block);
  }

  onLatestFulldiskImgLoad(image, band) {
    this.data.fulldiskImg = {image, band};
    this.emit(this.events.FULLDISK_IMAGE_UPDATE, this.data.fulldiskImg);
  }

}

module.exports = new ImageStore();