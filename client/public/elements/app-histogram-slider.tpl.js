import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
  }

  .border {
    padding: 5px;
    margin: 5px;
    text-align: center;
  }

  canvas {
    border: 1px solid #444;
  }
</style>  

<div class="border">
  <canvas width="256" height="256" @click="${this._onClick}"></canvas>
  <div style="display: flex">
    <div>&nbsp;&nbsp;0</div>
    <div style="flex:1; text-align: center">${this.selectedValueLabel}</div>
    <div>256</div>
  </div>
</div>

<div style="text-align: center">Set Color Balance Bounds</div>
<div style="display: flex">
  <div>Min <input type="number" min="0" max="255" .value="${this.min}" id="min" @change="${this._onBondsChange}" /></div>
  <div style="flex:1; text-align: center"></div>
  <div>Max <input type="number" min="0" max="255" .value="${this.max}" id="max" @change="${this._onBondsChange}" /></div>
</div>

`;}