import { html } from 'lit-element';
import sharedStyles from '../styles/shared'

export default function render() { 
return html`

${sharedStyles}
<style>
  :host {
    display: block;
  }

  .section {
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-gray);
    margin-bottom: 10px;
  }

  app-image-view-selector {
    margin-top: 12px;
    margin-bottom: 16px;
  }

  .grid-opts, .band-select {
    margin-bottom: 16px;
  }

  .band-select select {
    height: 35px;
    background-color: var(--color-gray6);
    border: 1px solid var(--tcolor-secondary);
    color: var(--tcolor-primary);
    -webkit-appearance: none;
  }

  .band-displayed {
    display: flex;
    align-items: center;
  }

  .band-displayed > div {
    flex: 1;
  }
</style>  

<div class="section">
  <h2>Latest Capture</h2>
  <div>${this.imageCaptureTimeStr}</div>
  <div>Time to Device: ${this.imageCaptureToDevice}</div>
</div>

<div class="section">
  <h2>Natural Phenomena</h2>
  <div>Lightning | Avg/Sec: ${this.avgLightningStrikes}</div>
</div>

<div class="section" style="border-bottom: none">
  <h2>Map Options</h2>

  <h3>Map View</h3>
  <p>Live image views update map imagery in real time. Grid view only shows block 
  updates to save bandwidth.</p>

  <app-image-view-selector></app-image-view-selector>

  <div class="grid-opts">
    <div>
      <input id="grid" type="checkbox" .checked="${this.gridModeEnabled}" @click="${this._onGridModeClicked}" /> 
      <label for="grid">Leave grid on map after capture</label>
    </div>
    <div ?hidden="${!this.gridModeEnabled}">
      <input id="label" type="checkbox" .checked="${this.labelModeEnabled}" @click="${this._onLabelModeClicked}" /> 
      <label for="label">Display product labels</label>
    </div>
  </div>

  <h3 class="band-displayed">
    <div>Band Displayed</div>
    <iron-icon icon="info" @click="${this._onBandInfoClicked}"></iron-icon>
  </h3>
  <div class="band-select">
    <select .value="${this.band}" @change="${this._onBandSelectChange}">
      ${this.bands.map(item => html`
        <option value="${item.band}">Band ${item.band}: ${item.label} ${item.type}</option>
      `)}
    </select>
  </div>

  <div ?hidden="${!this.imageModeEnabled}">
    <h3>Image Color Balance</h3>

    <div style="display:flex; justify-content: center">
      <app-histogram-slider></app-histogram-slider>
    </div>
  </div>
</div>
`;}