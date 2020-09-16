import { LitElement } from 'lit-element';
import render from "./simple-product-canvas.tpl.js"

import "@polymer/iron-icons"
import "./info-bar/app-info-bar"
import blockStore from "./render/block-store"
import strikeStore from "./render/strike-store"
import worker from "./balance-worker"
import "./app-histogram-slider"

export default class SimpleProductCanvas extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      infoOpen : {type: Boolean},
      canvasHeight : {type: Number},
      canvasWidth : {type: Number},
      filters : {type: Array},
      imageModeEnabled : {type: Boolean},
      histogram : {type: Object},
      mapView : {type : Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.filters = [];
    this.filtered = {};
    this.lightning = [];
    this.infoOpen = true;
    this.imageModeEnabled = true;
    this.gridModeEnabled = true;
    this.histogram = {};

    this.mapView = {
      panning : false,
      offset : {x: 0, y : 0},
      zoom : 1
    }

    // this.imageMode = 'boundary';
    // this.imageProductDef = APP_CONFIG.imageProduct[this.imageMode];

    this.data = {};

    this.rebalanceImgColorTimer = -1;
    this.unhandledResize = false;

    this._injectModel('AppStateModel', 'SocketModel');

    worker.onmessage = e => this._onColorRebalanceWorkerComplete(e);

    window.addEventListener('mousemove', e => this._onMouseMove(e));
    window.addEventListener('mouseup', e => this._onMouseUp(e));
    window.addEventListener('mouseout', e => this._onMouseOut(e));
    window.addEventListener('resize', () => this.onResize());
  }

  _onScroll(e) {
    let orgZoom = this.mapView.zoom;

    if( e.deltaY > 0 ) this.mapView.zoom = this.mapView.zoom - (this.mapView.zoom * 0.2);
    else this.mapView.zoom = this.mapView.zoom + (this.mapView.zoom * 0.2);

    if( this.mapView.zoom > 20 ) this.mapView.zoom = 20;
    if( this.mapView.zoom < 0.25 ) this.mapView.zoom = 0.25;

    let centerX = this.canvasWidth/2;
    let centerY = this.canvasHeight/2;

    let xMap = (centerX - this.mapView.offset.x) * orgZoom;
    let yMap = (centerY - this.mapView.offset.y) * orgZoom;

    let newOffsetX = centerX - (xMap / this.mapView.zoom);
    let newOffsetY = centerY - (yMap / this.mapView.zoom);

    this.mapView.offset = {
      x : newOffsetX,
      y : newOffsetY,
    }

    this.mapView.zoomChange = true;
  }

  _onMouseDown(e) {
    this.mapView.panning = true;
    this.mapView.panStartOffset = [
      this.mapView.offset.x,
      this.mapView.offset.y
    ]
    this.mapView.panStart = [
      e.clientX, e.clientY
    ];
  }

  _onMouseUp(e) {
    if( !this.mapView.panning ) return;
    this.mapView.panning = false;
  }

  _onMouseMove(e) {
    if( !this.mapView.panning ) return;
    let diffX = e.clientX - this.mapView.panStart[0];
    let diffY = e.clientY - this.mapView.panStart[1];

    this.mapView.offset = {
      x : this.mapView.panStartOffset[0] + diffX ,
      y : this.mapView.panStartOffset[1] + diffY
    }
  }

  _onMouseOut()  {
    if( !this.mapView.panning ) return;
    this.mapView.panning = false;
  }

  firstUpdated() {
    this.onResize(true);
    this.mapEle = this.shadowRoot.querySelector('#map');
    this.context = this.shadowRoot.querySelector('#vectorCanvas').getContext('2d');
    this.imgContext = this.shadowRoot.querySelector('#rasterCanvas').getContext('2d');
    this.balancedContext = this.shadowRoot.querySelector('#balancedCanvas').getContext('2d');

    this.shadowRoot.querySelector('#filters').style.display = "block";

    let histoEle = this.shadowRoot.querySelector('app-histogram-slider');
    this.absMin = histoEle.min;
    this.absMax = histoEle.max;

    this.AppStateModel.set({mode: this.imageMode});

    requestAnimationFrame(() => this.redraw());
  }

  onResize(first=false) {
    let w = window.innerWidth;
    let h = window.innerHeight;

    let mobile = (w < 678);
    if( !mobile ) w -= 350;

    this.canvasHeight = h;
    this.canvasWidth = w;

    if( first ) {
      if( w < h ) this.mapView.zoom = (2732 * 4) / w;
      else this.mapView.zoom = (2712 * 4) / h;

      let mapWidth = (2732 * 4)/  this.mapView.zoom ;
      this.mapView.offset = {
        x: (w/2) - (mapWidth/2), 
        y: 0
      }
    }

    if( w > 768 ) this.infoOpen = false;
    else if( w < 768 ) this.infoOpen = true;

    this.unhandledResize = true;

    if( this.resizeTimer ) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resizeTimer = null;
      this.redrawImgBlocks();
    }, 100);
  }

  _onAppStateUpdate(e) {
    this.setImageryMode(e.mode);

    if( !e.selectedBlockGroups ) return;
    if( this.selectedBlockGroups === e.selectedBlockGroups ) return;
    this.selectedBlockGroups = e.selectedBlockGroups;
    this.infoOpen = true;
  }

  _onFilldiskImageUpdate(data) {
    this.fulldiskImage = data;
    this.rebalanceImgColor();
  }

  setImageryMode(mode, gridModeEnabled=false) {
    // debugger;
    // this.gridModeEnabled = gridModeEnabled;

    // if( !mode ) return;
    // if( mode === this.imageMode ) return;

    // this.shadowRoot.querySelector('#histogram').imageModeUpdate(mode);

    // this.imageMode = mode;
    // this.backgroundImage = null;

    // this.imageModeEnabled = (mode !== 'boundary');

    // this.imageProductDef = APP_CONFIG.imageProduct[this.imageMode];
    // if( !this.imageProductDef ) {
    //   throw new Error('Unknown imageMode: '+this.imageMode);
    // }

    // if( this.imageMode !== 'boundary' ) {
    //   this.imgContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    //   this.balancedContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    //   let backgroundImage = new Image();
    //   backgroundImage.onload = () => {
    //     this.backgroundImage = backgroundImage;
    //     // this.imgContext.drawImage(this.backgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);
    //     this._renderImgCanvas(true);
    //   }
    //   backgroundImage.src = '/'+this.imageMode+'.png';
    // }

    this.onResize();
  }

  _onInfoClose() {
    this.infoOpen = false;
  }

  _onMenuIconClicked() {
    this.infoOpen = true;
  }

  addBlock(value) {
    value.age = Date.now();
    blockStore.setBlock(value, this);
    this.rebalanceImgColor();
  }

  setLightning(lightning) {
    strikeStore.addStrikes(lightning);
  }

  ensureFilter(value) {
    let updated = false;
    
    let filter = this.filters.find(item => item.label === value.label);
    if( !filter ) {
      filter = {
        label : value.label,
        enabled : true,
        bands : []
      }
      this.filters.push(filter);
      updated = true;
    }

    let band = filter.bands.find(item => item.id === value.band);
    if( !band ) {
      band = {
        apid: value.apid,
        id : value.band,
        enabled : true
      }
      filter.bands.push(band);
      filter.bands.sort((a, b) => {
        if( parseInt(a.id) < parseInt(b.id) ) return -1;
        if( parseInt(a.id) > parseInt(b.id) ) return 1;
        return 0;
      })
      updated = true;
    }

    if( updated ) {
      this.requestUpdate();
    }
  }


  redraw() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    let now = Date.now();
    
    // for( let strike of strikeStore.strikes ) {
    //   strike.redraw(this.context, this.scaleFactor, now);
    // }
    
    for( let id in blockStore.blocks ) {
      blockStore.blocks[id].redraw(this.context, now);
    }

    if( this.mapView.panning || this.mapView.zoomChange) {
      this.balancedContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.redrawImgBlocks();
      this.redrawRasterMask();
    }

    this.mapView.zoomChange = false;

    requestAnimationFrame(() => {
      // requestAnimationFrame(() => {
        requestAnimationFrame(() => this.redraw());
      // });
    });
  }

  rebalanceImgColor() {
    if( this.rebalanceImgColorTimer !== -1 ) {
      clearTimeout(this.rebalanceImgColorTimer);
    }

    this.rebalanceImgColorTimer = setTimeout(() => {
      this.rebalanceImgColorTimer = -1;
      this._rebalanceImgColor();
    }, 500);
  }

  _rebalanceImgColor() {
    console.log('color rebalance start');

    let data = [], block;
    for( let id in blockStore.blocks ) {
      block = blockStore.blocks[id];
      data.push({
        id,
        data: block.canvasImgData
      });
    }

    worker.postMessage({
      data: data,
      min : this.absMin,
      max : this.absMax
    });
  }

  _onHistogramBoundsChange(e) {
    this.absMin = e.detail.min;
    this.absMax = e.detail.max;
    this.rebalanceImgColor();
    // this.renderImgCanvas();
  }

  async _onColorRebalanceWorkerComplete(e) {
    this.histogram = e.data.histogram;

    this.balancedContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    console.log('color rebalance complete, setting block data');

    this._setBalancedData(e.data.data);

    this.redrawImgBlocks();
    this.redrawRasterMask();
  }

  async _setBalancedData(data) {
    for( let block of data ) {
      let blockRender = blockStore.blocks[block.id];
      await blockRender.setBalancedData(block.data);
    }

    this.redrawImgBlocks();
    this.redrawRasterMask();
  }

  redrawImgBlocks() {
    if( this.fulldiskImage ) {
      this.balancedContext.drawImage(this.fulldiskImage.image, 0, 0);
    }

    let blocks = Object.values(blockStore.blocks);
    blocks.sort((a, b) => a.lastUpdated < b.lastUpdated ? -1 : 1);
    for( let block of blocks ) {
      block.redrawImg(this.balancedContext);
    }
  }

  
  redrawRasterMask() {
    return;
    try {
      this.balancedContext.beginPath();

      this.balancedContext.rect(
        0, 0,
        this.canvasWidth,
        this.canvasHeight
      );

      this.balancedContext.arc(
        ((this.canvasWidth * this.mapView.zoom)/2) + this.mapView.offset.x,
        ((this.canvasHeight * this.mapView.zoom)/2) + this.mapView.offset.y, 
        Math.floor((this.canvasWidth-4)/2) * this.mapView.zoom, // radius
        0, 
        2 * Math.PI
      );

      this.balancedContext.closePath();
      this.balancedContext.fillStyle = 'blue';
      this.balancedContext.fill('evenodd');
    } catch(e) {

    }
  }

  fit(val, min, max) {
    if( val < min ) val = min;
    else if ( val > max ) val = max;

    val = val - min;

    return Math.round( ( val / (max-min)) * 255);
  }


  _onCanvasClicked(e) {
    let elePos = e.currentTarget.getBoundingClientRect();
    let x = Math.round((e.x - elePos.x) * this.mapView.zoom);
    let y = Math.round((e.y - elePos.y) * this.mapView.zoom);

    for( let id in blockStore.blocks ) {
      blockStore.blocks[id].selected = false;
    }
    let blockGroups = blockStore.getBlocks(x, y);
    blockGroups.forEach(block => block.selected = true);

    this.AppStateModel.set({selectedBlockGroups: blockGroups});
  }

}

customElements.define('simple-product-canvas', SimpleProductCanvas);
