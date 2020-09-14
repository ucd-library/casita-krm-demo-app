import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
  }

  h2 {
    padding-left: 10px;
  }

  h2 button {
    cursor: pointer;
    background: transparent;
    border: none;
    color: white;
    font-size: 20px;
    float: right;
  }

  h3 {
    padding-bottom: 2px;
    margin-bottom: 8px;
    border-bottom: 1px solid white;
  }

  .section {
    padding: 10px;
  }

  table {
    margin: 5px;
    background: rgba(100, 100, 100, 0.7);
    padding: 5px;
    border-radius: 5px;
  }

  .no-block-selected {
    padding: 20 10px;
    margin: 75px 5px 5px 5px;
    border: 3px dashed rgba(100, 100, 100, 0.7);
    border-radius: 5px;
  }

  .overflow {
    overflow-y: auto;
    height: 100%;
  }

  .blockgroup-label {
    padding-top: 15px;
    text-transform: uppercase;
    text-align: center;
  }

  .help {
    color: #bbb; 
    font-size: 14px
  }

  @media(min-width: 677px) {
    h2 button {
      display: none;
    }
  }
</style>  

<div class="overflow">
  <h2>GOES-R Preview <button @click="${this._onCloseClicked}"><iron-icon icon="close"></iron-icon></button></h2>

  <div class="section">
    <h3>Latest Image Capture</h3>
    <div>Capture Time: ${this.imageCaptureTimeStr}</div>
    <div>Time to Device: ${this.imageCaptureToDevice}s</div>
  </div>

  <div class="section">
    <h3>Lightning</h3>
    <div>Average: ${this.avgLightningStrikes} strikes/sec</div>
  </div>

  <div class="section">
    <h3>Map View</h3>
    <app-imagery-selector></app-imagery-selector>
    <!-- <h3>Imagery Mode</h3>
    <div>
      <input type="checkbox" id="image" .checked="${this.imageModeEnabled}" @click="${this._onImageryModeClicked}" /> 
    </div>
    <label for="image">Show live imagery from band 2 (visible).</label></div> 
    <label for="image">Show live imagery from band 3.</label></div>
    <div class="help">Note, this will use more data if you are on a mobile device.</div>
     -->

    <div ?hidden="${!this.imageModeEnabled}">
      <slot name="histogram"></slot>
    </div>
  </div>

  <div class="section">
    <h3>Display grid</h3>
    <div><input id="grid" type="checkbox" .checked="${this.gridModeEnabled}" @click="${this._onGridModeClicked}" /> 
    <label for="grid">Leave grid on map display after events.</label></div>
  </div>

  <div class="section" ?hidden="${!this.selectedBlockGroups.length}">
    <h3>Selected Block Information</h3>
    ${this.selectedBlockGroups.map(blockGroup => html`
      <div>
        <div class="blockgroup-label">${blockGroup.label}</div>

        <table>
          <tr>
            <th>Band</th>
            <th>Capture Time (Zulu)</th>
            <th>Time to Device (s)</th>
          </tr>
          ${blockGroup.products.map(block => html`
            <tr>
              <td>${block.band}</td>
              <td style="text-align: center">${block.localTime}</td>
              <td style="text-align: center">${block.age}</td>
            </tr>
          `)}
        </table>

      </div>
    `)}
  </div>

  <div class="section help no-block-selected"  ?hidden="${this.selectedBlockGroups.length}">
    *Click image block grid to see additional information.
  </div>
</div>
`;}