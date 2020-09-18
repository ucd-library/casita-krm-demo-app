import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
    width: 256px;
  }

  canvas {
    border: 1px solid #444;
  }

  input[type="number"] {
    width: 40px;
  }

  .slider {
    height: 17px;
    position: relative;
    margin-bottom: 8px;
  }

  .slider .line {
    position: absolute;
    top : 8px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--tcolor-secondary);
  }

  .slider button {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 11px;
    height: 18px;
    padding-left: 4px;
    background-color: transparent;
    border-radius: 0;
    border: none;
  }

  .slider button .btn-line {
    height: 17px;
    width: 3px;
    background-color: var(--tcolor-primary);
  }
</style>  

<canvas width="256" height="${this.histogramHeight}"></canvas>
<div style="display: flex;">
  <div>0</div>
  <div style="flex:1"></div>
  <div>256</div>
</div>

<div class="slider">

  <div class="line"></div>
  <button id="min" @mousedown="${this._onSliderMouseDown}" style="left: ${this.min-4}px">
    <div class="btn-line"></div>
  </button>
  <button id="max" @mousedown="${this._onSliderMouseDown}" style="left: ${this.max-4}px">
    <div class="btn-line"></div>
  </button>
</div>

<div style="display: flex">
  <input type="number" min="0" max="255" .value="${this.min}" id="min" @change="${this._onBondsChange}" />
  <div>&nbsp;MIN</div>
  <div style="flex:1"></div>
  <div>MAX&nbsp;</div>
  <input type="number" min="0" max="255" .value="${this.max}" id="max" @change="${this._onBondsChange}" />
</div>

`;}