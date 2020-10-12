import { LitElement } from 'lit-element';
import render from "./app-canvas-map.tpl.js"

import "@polymer/iron-icons"
import {EventBus} from '@ucd-lib/cork-app-utils'
import blockStore from "./render/block-store"
import strikeStore from "./render/strike-store"
import worker from "../balance-worker"
import "../app-histogram-slider"

window.blockStore = blockStore;

export default class AppCanvasMap extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      infoOpen : {type: Boolean},
      canvasHeight : {type: Number},
      canvasWidth : {type: Number},
      filters : {type: Array},
      histogram : {type: Object},
      mapView : {type : Object},
      lowLight : {type: Boolean}
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
    this.lowLight = false;

    this.imageMode = 'imagery';

    this.fulldiskWidth = (2732 * 4);
    this.fulldiskHeight = (2712 * 4);

    this.caCenter = [6705.5, 1718.5];

    // this.imageMode = 'boundary';
    // this.imageProductDef = APP_CONFIG.imageProduct[this.imageMode];

    this.data = {};

    this.rebalanceImgColorTimer = -1;

    let styles = getComputedStyle(document.documentElement);
    this.backgroundColor = styles.getPropertyValue('--tcolor-bg');
    this.globeBackgroundColor = styles.getPropertyValue('--gray6');

    worker.onmessage = e => this._onColorRebalanceWorkerComplete(e);

    window.addEventListener('mousemove', e => this._onMouseMove(e));
    window.addEventListener('touchmove', e => this._onTouchMove(e));
    window.addEventListener('mouseup', e => this._onMouseUp(e));
    window.addEventListener('mouseout', e => this._onMouseOut(e));
    window.addEventListener('touchend', e => this._onMouseUp(e));
    window.addEventListener('resize', () => this.onResize());

    EventBus.on('lightning-flash-update', e => {
      strikeStore.addStrikes(e);
    });
  }

  _onScroll(e) {
    let rect = this.getBoundingClientRect();
    let pt = [e.x, e.y - rect.top];

    if( e.deltaY > 0 ) {
      this._zoomTo(this.mapView.zoom - (this.mapView.zoom * 0.2), pt)
    } else {
      this._zoomTo(this.mapView.zoom + (this.mapView.zoom * 0.2), pt);
    }
  }

  _zoomTo(zoom, point) {
    let mapXy = this._screenPtToMapPt(point);

    if( zoom > 20 ) zoom = 20;
    if( zoom < 0.25 ) zoom = 0.25;

    let offsets = this._getOffsetForMapXyZoom(mapXy, point, zoom);

    this.mapView.zoom = zoom;
    this.mapView.offset = {
      x : offsets[0],
      y : offsets[1],
    }

    this.mapView.zoomChange = true;
  }

  _screenPtToMapPt(pt) {
    return [
      (pt[0] - this.mapView.offset.x) * this.mapView.zoom,
      (pt[1] - this.mapView.offset.y) * this.mapView.zoom
    ]
  }

  _mapPtToScreePt(pt) {
    return [
      (pt[0] / this.mapView.zoom) + this.mapView.offset.x,
      (pt[1] / this.mapView.zoom) + this.mapView.offset.y
    ]
  }

  _getOffsetForMapXyZoom(mPt, sPt, zoom) {
    return [
      (-1 * mPt[0]/zoom) + sPt[0],
      (-1 * mPt[1]/zoom) + sPt[1],
    ]
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

  _onTouchStart(e) {
    if( this.mapView.zooming ) return;

    if( e.touches.length === 1 ) {
      this.mapView.panning = true;
      this.mapView.panStartOffset = [
        this.mapView.offset.x,
        this.mapView.offset.y
      ]
      this.mapView.panStart = [
        e.touches[0].clientX, e.touches[0].clientY
      ];
    } else if( e.touches.length === 2 ) {
      // the one touch will always fire
      // clear the pan if we are going to start zooming
      this.mapView.panning = false;
      this.mapView.panStartOffset = null;
      this.mapView.panStart = null;

      this.mapView.zooming = true;

      let diff = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      )
      this.mapView.touchZoomStartDiff = diff;
    }
  }

  _onMouseUp(e) {
    if( !this.mapView.panning && !this.mapView.zooming ) return;
    this.mapView.panning = false;
    this.mapView.zooming = false;
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

  _onTouchMove(e) {
    if( !this.mapView.panning && !this.mapView.zooming ) return;

    if( this.mapView.panning ) {
      let diffX = e.touches[0].clientX - this.mapView.panStart[0];
      let diffY = e.touches[0].clientY - this.mapView.panStart[1];

      this.mapView.offset = {
        x : this.mapView.panStartOffset[0] + diffX ,
        y : this.mapView.panStartOffset[1] + diffY
      }
    } else if( this.mapView.zooming && e.touches.length > 1 ) {
      let diff = Math.sqrt(
        Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
        Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
      )

      let rect = this.getBoundingClientRect();
      let midX = (e.touches[0].clientX + e.touches[1].clientX)/2;
      let midY = (e.touches[0].clientY + e.touches[1].clientY - rect.top)/2;

      let amount = (this.mapView.touchZoomStartDiff - diff) / 75;

      this._zoomTo(this.mapView.zoom + (this.mapView.zoom * amount), [midX, midY]);
      this.mapView.touchZoomStartDiff = diff;
    }
  }

  _onMouseOut()  {
    if( !this.mapView.panning && !this.mapView.zooming ) return;
    this.mapView.panning = false;
    this.mapView.zooming = false;
  }

  firstUpdated() {
    this.onResize(true);

    this.mapEle = this.shadowRoot.querySelector('#map');
    this.context = this.shadowRoot.querySelector('#vectorCanvas').getContext('2d');
    this.balancedContext = this.shadowRoot.querySelector('#balancedCanvas').getContext('2d');
    this.rasterMaskContext = this.shadowRoot.querySelector('#rasterMaskCanvas').getContext('2d');

    // this.shadowRoot.querySelector('#filters').style.display = "block";

    // let histoEle = this.shadowRoot.querySelector('app-histogram-slider');
    // this.absMin = histoEle.min;
    // this.absMax = histoEle.max;

    this.AppStateModel.set({imageMode: this.imageMode});

    requestAnimationFrame(() => this.redraw());
  }

  onResize(first=false) {
    let w = window.innerWidth;
    let h = window.innerHeight-50;

    this.canvasHeight = h;
    this.canvasWidth = w;

    if( first ) {
      if( w < h ) this.mapView.zoom = this.fulldiskWidth / w;
      else this.mapView.zoom = this.fulldiskHeight / h;

      let mapWidth = this.fulldiskWidth /  this.mapView.zoom ;
      let mapHeight = this.fulldiskHeight /  this.mapView.zoom ;
      this.mapView.offset = {
        x: (w/2) - (mapWidth/2), 
        y: (h/2) - (mapHeight/2), 
      }
      this.mapView.zoomChange = true;
    }

    if( w > 768 ) this.infoOpen = false;
    else if( w < 768 ) this.infoOpen = true;

    if( this.resizeTimer ) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resizeTimer = null;
      this.clearBalancedCanvas();
      this.redrawImgBlocks();
      this.redrawRasterMask();
    }, 100);
  }

  _onAppStateUpdate(e) {
    this.appState = e;

    this.lowLight = e.lowLight || false;
    console.log(this.lowLight);

    if( this.band !== e.band ) {
      blockStore.destroy();
      this.band = e.band;
      this.clearBalancedCanvas();
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

    // if( this.view !== e.view ) {
      if( e.view === 'ca' ) {
        this.mapView.zoom = 2.2;
        let offsets = this._getOffsetForMapXyZoom(
          this.caCenter, 
          [this.canvasWidth/2, this.canvasHeight/2],
          this.mapView.zoom
        );
        this.mapView.offset = {
          x : offsets[0],
          y : offsets[1],
        }
        this.mapView.zoomChange = true;

      } else if( e.view === 'world') {
        if( this.canvasWidth < this.canvasHeight ) {
          this.mapView.zoom = this.fulldiskWidth / this.canvasWidth;
        } else {
          this.mapView.zoom = this.fulldiskHeight / this.canvasHeight;
        }

        let offsets = this._getOffsetForMapXyZoom(
          [this.fulldiskWidth/2, this.fulldiskHeight/2], 
          [this.canvasWidth/2, this.canvasHeight/2],
          this.mapView.zoom
        );
        this.mapView.offset = {
          x : offsets[0],
          y : offsets[1],
        }
        this.mapView.zoomChange = true;
      }


      this.view = e.view;
    // }


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

  redraw() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    let now = Date.now();
    
    for( let strike of strikeStore.strikes ) {
      strike.redraw(this.context, this.mapView, now);
    }
    
    for( let id in blockStore.blocks ) {
      blockStore.blocks[id].redraw(this.context, now);
    }

    if( this.mapView.panning || this.mapView.zoomChange) {
      this.clearBalancedCanvas();
      this.redrawImgBlocks();
      this.redrawRasterMask();
    }

    this.mapView.zoomChange = false;

    // requestAnimationFrame(() => {
      requestAnimationFrame(() => this.redraw());
    // });
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
  }

  async _setBalancedData(e) {
    let blocks = Object.values(blockStore.blocks);
    blocks.sort((a, b) => a.lastUpdated < b.lastUpdated ? -1 : 1);
    
    let c = 0;
    for( let block of blocks ) {
      let resp = await block.setBalancedData(e.min, e.max, this.balancedContext);
      if( resp !== false) c++;
    }
    // console.log('Block count requiring update after balance: '+c, ((c/blocks.length)*100)+'%', e.min, e.max);

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
    try {
      this.rasterMaskContext.clearRect(
        0, 0,
        this.canvasWidth,
        this.canvasHeight
      );

      this.rasterMaskContext.beginPath();
      this.rasterMaskContext.rect(
        0, 0,
        this.canvasWidth,
        this.canvasHeight
      );

      let centerx = this.fulldiskWidth/2;
      let centery = this.fulldiskHeight/2;

      let screenX = Math.floor((centerx/this.mapView.zoom) + this.mapView.offset.x)-5;
      let screenY = Math.floor((centery/this.mapView.zoom) + this.mapView.offset.y);

      this.rasterMaskContext.arc(
        screenX,
        screenY, 
        (centerx/this.mapView.zoom), // radius
        0, 
        2 * Math.PI
      );

      this.rasterMaskContext.closePath();
      this.rasterMaskContext.fillStyle = this.backgroundColor;
      this.rasterMaskContext.fill('evenodd');
    } catch(e) {
      console.error('error making raster mask', e)
    }
  }

  clearBalancedCanvas() {
    this.balancedContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    let centerx = this.fulldiskWidth/2;
    let centery = this.fulldiskHeight/2;

    let screenX = Math.floor((centerx/this.mapView.zoom) + this.mapView.offset.x)-5;
    let screenY = Math.floor((centery/this.mapView.zoom) + this.mapView.offset.y);

    this.balancedContext.beginPath();
    this.balancedContext.arc(
      screenX,
      screenY, 
      (centerx/this.mapView.zoom), // radius
      0, 
      2 * Math.PI
    );
    this.balancedContext.closePath();
    this.balancedContext.fillStyle = this.globeBackgroundColor;
    this.balancedContext.fill();
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
