import { LitElement } from 'lit-element';
import render from "./app-info-bar.tpl.js"

import "./app-imagery-selector"

export default class AppInfoBar extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      avgLightningStrikes : {type: Number},
      imageCaptureTime : {type: Date},
      imageCaptureTimeStr : {type: String},
      imageCaptureToDevice : {type: String},
      selectedBlockGroups : {type: Array},
      gridModeEnabled : {type: Boolean},
      imageModeEnabled : {type: Boolean}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.totalLightningStrikes = 0;
    this.imageCaptureTimeStr = '';
    this.imageCaptureToDevice = '';

    this.selectedBlockGroups = [];

    this.imageModeEnabled = false;
    this.gridModeEnabled = false;

    this._injectModel('SocketModel', 'AppStateModel');
  }

  _onAppStateUpdate(e) {
    this.appState = e;
    this.gridModeEnabled = e.gridModeEnabled ? true : false;
    this.imageModeEnabled = (e.mode !== 'boundary');
    this._renderSelectedBlockGroups();
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

  // _onImageryModeClicked(e) {
  //   let enabled = e.currentTarget.checked;
  //   this.AppStateModel.set({imageModeEnabled: enabled});
  // }

  _onGridModeClicked(e) {
    let enabled = e.currentTarget.checked;
    this.AppStateModel.set({gridModeEnabled: enabled});
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
    this.avgLightningStrikes = Math.round(avg);
  }

  _onCloseClicked() {
    this.dispatchEvent(new CustomEvent('close'));
  }

}

customElements.define('app-info-bar', AppInfoBar);
