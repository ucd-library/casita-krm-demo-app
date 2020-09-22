import { LitElement } from 'lit-element';
import render from "./app-band-info-popup.tpl.js"

import BAND_METADATA from "../band-metadata"

export default class AppBandInfoPopup extends LitElement {

  static get properties() {
    return {
      band : {type: Number},
      band : {type: Array},
      metadata : {type: Object}
    }
  }

  constructor() {
    super();

    this.band = 1;
    this.bands = BAND_METADATA;
    this.metadata = BAND_METADATA[0];

    this.render = render.bind(this);
  }

  updated(props) {
    if( props.has('band') && this.band !== undefined ) {
      this.metadata = BAND_METADATA.find(item => item.band === this.band);
      this.requestUpdate();
    }
  }

  show(band) {
    this.band = band;
    this.style.display = 'block';
  }

  hide() {
    this.style.display = 'none';
  }

  _onBandSelectChange(e) {
    this.band = parseInt(e.currentTarget.value);
  }

  _onPrevClick(e) {
    let b = this.band - 1;
    if( b < 1 ) b = 16;
    this.band = b;
  }

  _onNextClick(e) {
    let b = this.band + 1;
    if( b > 16 ) b = 1;
    this.band = b;
  }
}

customElements.define('app-band-info-popup', AppBandInfoPopup);
