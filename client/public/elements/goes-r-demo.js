import { LitElement } from 'lit-element';
import render from "./goes-r-demo.tpl.js"

import "@ucd-lib/cork-app-utils"
import "../src"
import "./simple-product-canvas"

export default class GoesRDemo extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      products : {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.products = [];
    this.productsLookup = {};

    this._injectModel('AppStateModel', 'SocketModel', 'ImageModel');
    this.AppStateModel.set({
      band : 2
    });
  }

  firstUpdated() {
    this.canvas = this.shadowRoot.querySelector('simple-product-canvas');
  }

  _onBlockUpdate(e) {
    if( !this.canvas ) return;
    this.canvas.addBlock(e.payload);
  }

  _onLightningEventsUpdate(e) {
    if( !this.canvas ) return;
    this.canvas.setLightning(e);
  }

}

customElements.define('goes-r-demo', GoesRDemo);
