import { LitElement } from 'lit-element';
import render from "./goes-r-demo.tpl.js"

import "@ucd-lib/cork-app-utils"
import "../src"

import "./styles/properties"

import "@polymer/iron-icons"
import "@polymer/iron-icons/image-icons"

import "./left-bar/app-left-bar"
import "./map/app-canvas-map"
import "./layout/app-header"

export default class GoesRDemo extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      products : {type: Array},
      showNav : {type: Boolean},
      lowLight : {type: Boolean}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.products = [];
    this.productsLookup = {};

    this.showNav = false;

    this._injectModel('AppStateModel', 'SocketModel', 'ImageModel');
    this.AppStateModel.set({
      band : 2,
      lightningEnabled : true
    });

    // ios hack
    window.addEventListener('touchmove',  (event) => {
      if ( event.scale !== undefined && event.scale !== 1 ) {
        event.preventDefault(); 
      }
    }, { passive: false });

  }

  _onAppStateUpdate(e) {
    this.lowLight = e.lowLight || false;
  }

  firstUpdated() {
    this.canvas = this.shadowRoot.querySelector('app-canvas-map');
    // this.debug = this.shadowRoot.querySelector('#debug');
    // this.debug.innerHTML=JSON.stringify({
    //   v:this.v,
    //   total:0
    // }, '  ', '  ');
  }

  _onBlockUpdate(e) {
    if( !this.canvas ) return;
    this.canvas.addBlock(e.payload);
  }

  // _onLightningEventsUpdate(e) {
  //   if( !this.canvas ) return;
  //   this.canvas.setLightning(e);
  // }

  _onNavClicked(e) {
    this.showNav = e.currentTarget.hasAttribute('open') ? true : false;
  }

}

customElements.define('goes-r-demo', GoesRDemo);
