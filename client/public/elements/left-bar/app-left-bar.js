import { LitElement } from 'lit-element';
import render from "./app-left-bar.tpl.js"
import clone from "clone"

import bandMetadata from "../band-metadata"
import "./app-image-view-selector"


export default class AppLeftBar extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      avgLightningStrikes : {type: Number},
      showLightning : {type: Boolean},
      imageCaptureTime : {type: Date},
      imageCaptureTimeStr : {type: String},
      imageCaptureToDevice : {type: String},
      selectedBlockGroups : {type: Array},
      gridModeEnabled : {type: Boolean},
      labelModeEnabled : {type: Boolean},
      imageModeEnabled : {type: Boolean},
      band : {type: Number},
      bands : {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.totalLightningStrikes = 0;
    this.imageCaptureTimeStr = 'NA';
    this.imageCaptureToDevice = 'NA';
    this.avgLightningStrikes = 'NA';

    this.showLightning = false;

    this.bands = clone(bandMetadata);

    this.selectedBlockGroups = [];

    this.imageModeEnabled = false;
    this.gridModeEnabled = false;

    this._injectModel('SocketModel', 'AppStateModel', 'ImageModel');
  }

  _onAppStateUpdate(e) {
    this.appState = e;
    
    this.band = e.band;
    this.imageModeEnabled = (e.imageMode === 'imagery');
    this.gridModeEnabled = e.gridModeEnabled ? true : false;
    this.labelModeEnabled = e.labelModeEnabled ? true : false;

    this._renderSelectedBlockGroups();
  }

  _onLatestImageCaptureTimeUpdate(e) {
    let hour = e.date.getHours();
    let meridiem = 'am';
    if( hour > 12 ) {
      hour = hour-12;
      meridiem = 'pm'
    }

    let month = this._formatDT(e.date.getMonth()+1);
    let date = this._formatDT(e.date.getDate());
    let min = this._formatDT(e.date.getMinutes());
    let sec = this._formatDT(e.date.getMinutes());

    this.imageCaptureTimeStr = e.date.getFullYear()+'-'+month+'-'+date + ', ' + 
      hour+':'+min+':'+sec+meridiem;
    this.imageCaptureToDevice = Math.floor(e.ttd/1000)+'s';
  }

  _formatDT(val) {
    if( val < 10 ) return '0'+val;
    return val;
  }

  _renderSelectedBlockGroups() {
    if( !this.appState ) return;

    if( !this.appState.selectedBlockGroups ) {
      this.selectedBlockGroups = [];
      return;
    }

    this.selectedBlockGroups = this.appState.selectedBlockGroups.map(blockGroup => {
      let group = {
        label : blockGroup.type,
        products : []
      }

      for( let apid in blockGroup.blocks ) {
        group.products.push({
          band : blockGroup.blocks[apid].band,
          localTime : blockGroup.blocks[apid].localTime.toISOString().split('T')[1].split('.')[0],
          age :  Math.floor((blockGroup.blocks[apid].age - blockGroup.blocks[apid].localTime.getTime()) /1000)
        });
      }

      group.products.sort((a, b) => {
        if( parseInt(a.band) < parseInt(b.band) ) return -1;
        if( parseInt(a.band) > parseInt(b.band) ) return 1;
        return 0;
      });

      return group;
    });
  }

  _onBandSelectChange(e) {
    this.AppStateModel.set({band: parseInt(e.currentTarget.value)});
  }

  _onGridModeClicked(e) {
    let enabled = e.currentTarget.checked;
    this.AppStateModel.set({gridModeEnabled: enabled});
  }

  _onLabelModeClicked(e) {
    let enabled = e.currentTarget.checked;
    this.AppStateModel.set({labelModeEnabled: enabled});
  }

  _onImageBoundaryUpdate(e) {
    if( !this.imageCaptureTime ) {
      this.imageCaptureTime = e.payload.localTime;
    } else if( this.imageCaptureTime.getTime() < e.payload.localTime.getTime() ) {
      this.imageCaptureTime = e.payload.localTime;
    }
    this.imageCaptureTimeStr = this.imageCaptureTime.toISOString();
    this.imageCaptureToDevice = Math.floor((Date.now() - this.imageCaptureTime.getTime()) / 1000)
  
    this._renderSelectedBlockGroups();
  }

  _onLightningStrikeCountUpdate(e) {
    if( this.totalLightningStrikes === 0 ) {
      this.totalLightningStrikes = e;
      this.lightningStrikeStartTime = Date.now();
      return;
    }
    this.totalLightningStrikes += e;

    let avg = this.totalLightningStrikes / ((Date.now() - this.lightningStrikeStartTime) / 1000);
    this.avgLightningStrikes = Math.round(avg)+' strikes/sec';
  }

  _onCloseClicked() {
    this.dispatchEvent(new CustomEvent('close'));
  }

}

customElements.define('app-left-bar', AppLeftBar);