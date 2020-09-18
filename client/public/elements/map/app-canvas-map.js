import { LitElement } from 'lit-element';
import render from "./app-canvas-map.tpl.js"

import "@polymer/iron-icons"
import blockStore from "./render/block-store"
import strikeStore from "./render/strike-store"
import worker from "../balance-worker"
import "../app-histogram-slider"

export default class AppCanvasMap extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      infoOpen : {type: Boolean},
      canvasHeight : {type: Number},
      canvasWidth : {type: Number},
      filters : {type: Array},
      histogram : {type: Object},
      mapView : {type : Object}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel', 'SocketModel', 'ImageModel');

    this.filters = [];
    this.filtered = {};
    this.lightning = [];
    this.infoOpen = true;

    this.histogram = {};
    this.fit = {};

    this.mapView = {
      panning : false,
      offset : {x: 0, y : 0},
      zoom : 1
    }

    let {absMin, absMax} = this.ImageModel.getHistogram();
    this.absMin = absMin;
    this.absMax = absMax;

    this.imageMode = 'imagery';

    // this.imageMode = 'boundary';
    // this.imageProductDef = APP_CONFIG.imageProduct[this.imageMode];

    this.data = {};

    this.rebalanceImgColorTimer = -1;
    this.unhandledResize = false;

    

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
    this.balancedContext = this.shadowRoot.querySelector('#balancedCanvas').getContext('2d');

    // this.shadowRoot.querySelector('#filters').style.display = "block";

    // let histoEle = this.shadowRoot.querySelector('app-histogram-slider');
    // this.absMin = histoEle.min;
    // this.absMax = histoEle.max;

    this.AppStateModel.set({imageMode: this.imageMode});

    requestAnimationFrame(() => this.redraw());
  }

  onResize(first=false) {
    let w = window.innerWidth;
    let h = window.innerHeight-60;

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
      this.mapView.zoomChange = true;
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
    this.appState = e;

    if( this.band !== e.band ) {
      blockStore.destroy();
      this.band = e.band;
      this.balancedContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    } else{
      blockStore.updateSettings(e);
    }

    for( let id in blockStore.blocks ) {
      blockStore.blocks[id].updateSettings(e)
    }

    if( this.imageMode != e.imageMode ) {
      this.mapView.zoomChange = true;
      this.imageMode = e.imageMode;
    }

    if( this.view !== e.view ) {
      if( e.view === 'ca' ) {
        this.mapView.offset = {
          x: -2902 + (this.canvasWidth / 4), 
          y: -445
        }
        this.mapView.zoom = 2;
        this.mapView.zoomChange = true;
        this.onResize();
      } else if( e.view === 'world') {
        this.onResize(true);
      }


      this.view = e.view;
    }


    // this.setimageMode(e.mode);

    // if( !e.selectedBlockGroups ) return;
    // if( this.selectedBlockGroups === e.selectedBlockGroups ) return;
    // this.selectedBlockGroups = e.selectedBlockGroups;
    // this.infoOpen = true;
  }

  _onImageHistogramUpdate(e) {
    if( e.absMin !== this.absMin || e.absMax !== this.absMax ) {
      this.absMin = e.absMin;
      this.absMax = e.absMax;
      this.rebalanceImgColor();
    }
  }

  _onFilldiskImageUpdate(data) {
    this.fulldiskImage = data;
    this.rebalanceImgColor();
  }

  addBlock(value) {
    value.age = Date.now();
    blockStore.setBlock(value, this);
    this.rebalanceImgColor();
  }

  setLightning(lightning) {
    strikeStore.addStrikes(lightning);
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
      requestAnimationFrame(() => this.redraw());
    });
  }

  rebalanceImgColor() {
    if( this.imageMode !== 'imagery' ) return;

    if( this.rebalanceImgColorTimer !== -1 ) {
      clearTimeout(this.rebalanceImgColorTimer);
    }

    this.rebalanceImgColorTimer = setTimeout(() => {
      this.rebalanceImgColorTimer = -1;
      this._rebalanceImgColor();
    }, 500);
  }

  _rebalanceImgColor() {
    let data = [], block;
    for( let id in blockStore.blocks ) {
      block = blockStore.blocks[id];
      if( !block.sampledImgData ) continue;
      data.push({
        id,
        data: block.sampledImgData
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
    this.fit.min = e.data.min;
    this.fit.max = e.data.max;

    this.ImageModel.setHistogramData(e.data.histogram, e.data.min, e.data.max);

    this._setBalancedData(e.data);
    this.redrawRasterMask();
  }

  async _setBalancedData(e) {
    let blocks = Object.values(blockStore.blocks);
    blocks.sort((a, b) => a.lastUpdated < b.lastUpdated ? -1 : 1);
    
    let c = 0;
    for( let block of blocks ) {
      let resp = await block.setBalancedData(e.min, e.max, this.balancedContext);
      if( resp !== false) c++;
    }
    console.log('Block count requiring update after balance: '+c, ((c/blocks.length)*100)+'%', e.min, e.max);

    this.redrawRasterMask();
  }

  redrawImgBlocks() {
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

customElements.define('app-canvas-map', AppCanvasMap);
