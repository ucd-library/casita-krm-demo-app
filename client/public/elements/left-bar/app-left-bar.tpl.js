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

  iron-icon[icon="image:flash-on"] {
    width: 16px;
    height: 16px;
    border-radius: 20px;
    padding: 2px;
    vertical-align: middle;
  }

  iron-icon[icon="image:flash-on"][active] {
    background: var(--tcolor-primary);
  }

  .band-select select {
    height: 35px;
    background-color: var(--color-gray6);
    border: 1px solid var(--tcolor-secondary);
    color: var(--tcolor-primary);
    -webkit-appearance: none;
    box-sizing: border-box;
    width: 100%;
    padding-left: 10px;

    background:
      linear-gradient(45deg, transparent 50%, var(--tcolor-secondary) 50%),
      linear-gradient(135deg, var(--tcolor-secondary) 50%, transparent 50%);
    background-position:
      calc(100% - 21px) calc(1em + 2px),
      calc(100% - 16px) calc(1em + 2px),
      100% 0;
    background-size:
      5px 5px,
      5px 5px,
      2.5em 2.5em;
    background-repeat: no-repeat;
  }

  .band-displayed {
    display: flex;
    align-items: center;
  }

  .band-displayed iron-icon {
    color: var(--tcolor-text);
  }

  .band-displayed > div {
    flex: 1;
  }

  .channel-status {
    display: flex;
    margin: 2px;
  }
  .channel-status iron-icon {
    vertical-align: middle;
  }
  .channel-status .active {
    color: var(--color-green);
  }
  .channel-status .down {
    color: var(--color-rose);
  }
</style>  

<div style="margin-bottom: 16px" ?hidden="${this.channel1Active && this.channel2Active}">
  <h2>Receiver Status</h2>
  <div class="channel-status">
    <div>Channel 1:&nbsp;&nbsp;</div> 
    <div>
      <div class="label active" ?hidden="${!this.channel1Active}">
        <iron-icon icon="swap-horiz"></iron-icon> Active
      </div>
      <div class="label down" ?hidden="${this.channel1Active}">
        <iron-icon icon="error-outline"></iron-icon> Down
      </div>
    </div>
  </div>
  <div class="channel-status">
    <div>Channel 2:&nbsp;&nbsp;</div> 
    <div>
      <div class="label active" ?hidden="${!this.channel2Active}">
        <iron-icon icon="swap-horiz"></iron-icon> Active
      </div>
      <div class="label down" ?hidden="${this.channel2Active}">
        <iron-icon icon="error-outline"></iron-icon> Down
      </div>
    </div>
  </div>
</div>

<div class="section">
  <h2>Latest Capture</h2>
  <div>${this.imageCaptureProduct}</div>
  <div>${this.imageCaptureTimeStr}</div>
  <div>Time to Device: ${this.imageCaptureToDevice}</div>
</div>

<div class="section">
  <h2>Natural Phenomena</h2>
  <div>
    <iron-icon icon="image:flash-on" ?active="${this.avgLightningStrikes !== 'NA' && this.avgLightningStrikes !== 0}"></iron-icon> 
    Lightning | Avg/Sec: ${this.avgLightningStrikes}
  </div>
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
    <iron-icon icon="info-outline" @click="${this._onBandInfoClicked}"></iron-icon>
  </h3>
  <div class="band-select">
    <select .value="${this.band}" @change="${this._onBandSelectChange}">
      ${this.bands.map(item => html`
        <option value="${item.band}">Band ${item.band}: ${item.label} ${item.type}</option>
      `)}
    </select>
  </div>

  <div style="margin-bottom: 15px">
    <input id="hires" type="checkbox" @click="${this._onHighResClick}" /> 
    <label for="hires">Display full resolution images.  Warning
      this will greatly increase bandwidth used.
    </label>
  </div>

  <div ?hidden="${!this.imageModeEnabled}">
    <h3>Image Color Balance</h3>

    <div style="display:flex; justify-content: center">
      <app-histogram-slider></app-histogram-slider>
    </div>
  </div>
</div>
`;}