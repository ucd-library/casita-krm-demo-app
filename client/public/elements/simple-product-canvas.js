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

    this.scaleFactor = 25;

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

    this.renderImgCanvasTimer = -1;
    this.unhandledResize = false;

    this._injectModel('AppStateModel', 'SocketModel');

    worker.onmessage = e => this._renderImgCanvasAfterBalance(e);

    window.addEventListener('mousemove', e => this._onMouseMove(e));
    window.addEventListener('mouseup', e => this._onMouseUp(e));
    window.addEventListener('mouseout', e => this._onMouseOut(e));
    window.addEventListener('resize', () => this.onResize());
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

    requestAnimationFrame(() => this.redraw());
  }

  _onMouseUp(e) {
    if( !this.mapView.panning ) return;
    this.mapView.offset = {
      x : this.mapView.panStartOffset[0] + e.clientX - this.mapView.panStart[0],
      y : this.mapView.panStartOffset[1] + e.clientY - this.mapView.panStart[1]
    }
  }

  _onMouseMove(e) {
    if( !this.mapView.panning ) return;
    this.mapView.offset = {
      x : this.mapView.panStartOffset[0] + e.clientX - this.mapView.panStart[0],
      y : this.mapView.panStartOffset[1] + e.clientY - this.mapView.panStart[1]
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
    let size = null;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let mobile = (w < 678);

    if( !mobile ) w -= 350;

    if( w < h ) {
      size = w
    } else {
      size = h;
    }

    this.canvasHeight = size;
    this.canvasWidth = size;

    this.scaleFactor = 2732 / size;
    this.scaleFactorLR = 2712 / size;
    // this.scaleFactor = this.imageProductDef.size[0] / size;
    // this.scaleFactorLR = this.imageProductDef.size[1] / size;

    if( w > 768 ) this.infoOpen = false;
    else if( w < 768 ) this.infoOpen = true;

    this.unhandledResize = true;

    if( !first ) this.renderImgCanvas();
  }

  _onAppStateUpdate(e) {
    this.setImageryMode(e.mode);

    if( !e.selectedBlockGroups ) return;
    if( this.selectedBlockGroups === e.selectedBlockGroups ) return;
    this.selectedBlockGroups = e.selectedBlockGroups;
    this.infoOpen = true;
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
    let block = blockStore.setBlock(value, this);
    this.onRenderImgBlock(block);
    // if( !block.handlerSet ) {
    //   block.handlerSet = true;
    //   block.on('new-image-ready', (block) => this.onRenderImgBlock(block));
    // }
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
    
    for( let strike of strikeStore.strikes ) {
      strike.redraw(this.context, this.scaleFactor, now);
    }
    
    for( let id in blockStore.blocks ) {
      blockStore.blocks[id].redraw(this.context, this.scaleFactor, now);
    }

    // requestAnimationFrame(() => {
    //   requestAnimationFrame(() => {
    //     requestAnimationFrame(() => this.redraw());
    //   });
    // });
  }

  onRenderImgBlock(block) {
    this.renderImgCanvas(block);
  }

  renderImgCanvas(block, resize=false) {
    if( block ) {
      block.redrawImg(this.imgContext, this.scaleFactor, this.scaleFactorLR);
    }

    if( this.renderImgCanvasTimer !== -1 ) {
      clearTimeout(this.renderImgCanvasTimer);
    }

    this.renderImgCanvasTimer = setTimeout(() => {
      this.renderImgCanvasTimer = -1;
      this._renderImgCanvas();
    }, 500);
  }

  _renderImgCanvas(forceFullRender=false) {
    // console.time('image canvas render');

    // this.imgContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    if( this.unhandledResize || forceFullRender ) {
      this.unhandledResize = false;

      if( this.backgroundImage ) {
        this.imgContext.drawImage(this.backgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);
      }

      for( let id in blockStore.blocks ) {
        blockStore.blocks[id].redrawImg(this.imgContext, this.scaleFactor);
      }
    }

    console.log('color balance');
    // color balance block store
    let imgData = this.imgContext.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    worker.postMessage({
      data: imgData.data, 
      width: this.canvasWidth, 
      height: this.canvasHeight,
      min : this.absMin,
      max : this.absMax
    });
  }

  _onHistogramBoundsChange(e) {
    this.absMin = e.detail.min;
    this.absMax = e.detail.max;
    this.renderImgCanvas();
  }

  _renderImgCanvasAfterBalance(e) {
    this.histogram = e.data.histogram;
    this.finalRaster = new ImageData(e.data.data, e.data.width, e.data.height);
    this.redrawRaster();
  }

  redrawRaster() {
    if( !this.finalRaster ) return;

    this.balancedContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.balancedContext.putImageData(this.finalRaster, this.mapView.offset.x, this.mapView.offset.y);
    this.balancedContext.beginPath();
    this.balancedContext.rect(
      this.mapView.offset.x, this.mapView.offset.y,
      this.canvasWidth,
      this.canvasHeight
    );

    this.balancedContext.arc(
      this.canvasWidth/2 - this.mapView.offset.x, 
      this.canvasHeight/2 - this.mapView.offset.y, 
      Math.floor((this.canvasWidth-4)/2), // radius
      0, 
      2 * Math.PI
    );

    this.balancedContext.closePath();
    this.balancedContext.fillStyle = 'black';
    this.balancedContext.fill('evenodd');
  }

  fit(val, min, max) {
    if( val < min ) val = min;
    else if ( val > max ) val = max;

    val = val - min;

    return Math.round( ( val / (max-min)) * 255);
  }


  _onCanvasClicked(e) {
    let elePos = e.currentTarget.getBoundingClientRect();
    let x = Math.round((e.x - elePos.x) * this.scaleFactor);
    let y = Math.round((e.y - elePos.y) * this.scaleFactor);

    for( let id in blockStore.blocks ) {
      blockStore.blocks[id].selected = false;
    }
    let blockGroups = blockStore.getBlocks(x, y);
    blockGroups.forEach(block => block.selected = true);
    console.log(blockGroups);

    this.AppStateModel.set({selectedBlockGroups: blockGroups});
  }

}

customElements.define('simple-product-canvas', SimpleProductCanvas);
