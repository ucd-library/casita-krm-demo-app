import { html } from 'lit-element';
import sharedStyles from '../styles/shared'

export default function render() { 
return html`

${sharedStyles}
<style>
  :host {
    display: none;
    position: absolute;
    top : 0;
    left : 0;
    right: 0;
    bottom: 0;
    z-index: 5000;
    max-height: 100%;
    background-color: rgba(51,51,51, 0.65);
  }

  .layout {
    position: absolute;
    top : 0;
    left : 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    max-height: 100%;
  }

  .main-panel {
    background-color: var(--color-gray6);
    padding: 8px;
    max-width: 600px;
    margin: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }

  .close-panel {
    display: flex;
    align-items: center;
    height: 40px;
    text-align: right;
    flex-direction: row-reverse;
  }

  .close-panel iron-icon {
    cursor: pointer;
    color: var(--tcolor-secondary);
  }

  .content-panel {
    padding: 0 32px 32px 32px;
    overflow-y: auto;
  }

  h2 {
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid gray;
  }

  .band {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .info-num {
    font-size: 50px;
    line-height: 55px;
    font-weight: var(--font-weight-bold);
    color: var(--tcolor-primary);
    margin-right: 20px;
  }

  .select-panel {
    display: flex;
    padding-top: 20px;
    padding-bottom: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid gray;
  }

  select {
    height: 35px;
    background-color: var(--color-gray6);
    border: 1px solid var(--tcolor-secondary);
    color: var(--tcolor-primary);
    -webkit-appearance: none;
    flex: 1;
    width: 100%;
    box-sizing: border-box;
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

  button {
    border: none;
    background-color: var(--tcolor-secondary);
    border-radius: 24px;
  }

  a:visited {
    color: var(--color-gray70);
  }

  @media(max-width: 768px) {
    .main-panel {
      margin: 0;
      height: 100vh;
      width: 100vw;
    }
  }
</style>

<div class="layout">
  <div class="main-panel">
    <div class="close-panel">
      <iron-icon icon="close" @click="${this.hide}" tabindex="1"></iron-icon>
    </div>

    <div class="content-panel">
      <h2>ABI BAND INFORMATION</h2>
      
      <div class="band">
        <div class="info-num">${this.metadata.band}</div>
        <h1>${this.metadata.label} (${this.metadata.wavelength} <span style="text-transform: initial;">&#956;m</span>) | ${this.metadata.type}</h1>
      </div>

      <p>${this.metadata.description}</p>

      <div class="select-panel">
        <button @click="${this._onPrevClick}"><iron-icon icon="chevron-left"></iron-icon></button>
        <div style="flex:1; padding: 0 16px;">
          <select .value="${this.band}" @change="${this._onBandSelectChange}">
            ${this.bands.map(item => html`
              <option value="${item.band}">Band ${item.band}: ${item.label} (${item.type})</option>
            `)}
          </select>
        </div>
        <button @click="${this._onNextClick}"><iron-icon icon="chevron-right"></iron-icon></button>
      </div>

      <h3>What are ABI Bands?</h3>

      <p class="text-gray" style="margin-bottom: 15px">The Advanced Baseline Imager is the primary instrument on the GOES-R
        Series for imaging Earth’s weather, oceans and environment. ABI views
        the Earth with 16 different spectral bands, including two visible channels,
        four near-infrared channels, and ten infrared channels. These different
        channels (wavelengths, μm) are used by models and tools to indicate
        various elements on the Earth’s surface or in the atmosphere, such as
        trees, water, clouds, moisture or smoke.
      </p>

      <p class="text-gray">
        For more in-depth information about individual ABI Bands, see the 
        <a href="https://www.goes-r.gov/mission/ABI-bands-quick-info.html" target="_blank">ABI
        Bands Quick Information Guides</a> available on the GOES-R website.
      </p>
    </div>

  </div>
</div>

`;}