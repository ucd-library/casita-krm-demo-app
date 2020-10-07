import { LitElement } from 'lit-element';
import render from "./goes-r-demo.tpl.js"

import "@ucd-lib/cork-app-utils"
import "../src"

import "./styles/properties"

import "./left-bar/app-left-bar"
import "./map/app-canvas-map"
import "./layout/app-header"

export default class GoesRDemo extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      products : {type: Array},
      showNav : {type: Boolean}
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
      band : 1,
      lightningEnabled : true
    });

    // ios hack
    document.addEventListener('touchmove', function (event) {
      if ( event.scale !== undefined && event.scale !== 1 ) {
        event.preventDefault(); 
      }
    }, { passive: false });
  }

  firstUpdated() {
    this.canvas = this.shadowRoot.querySelector('app-canvas-map');
  }

  _onBlockUpdate(e) {
    if( !this.canvas ) return;
    this.canvas.addBlock(e.payload);
  }

  _onLightningEventsUpdate(e) {
    if( !this.canvas ) return;
    this.canvas.setLightning(e);
  }

  _onNavClicked(e) {
    this.showNav = e.currentTarget.hasAttribute('open') ? true : false;
  }

}

customElements.define('goes-r-demo', GoesRDemo);
