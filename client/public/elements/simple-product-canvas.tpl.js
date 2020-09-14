import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
    height: 100vh;
  }
  .layout {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1
  }

  button {
    background: transparent;
    border: none;
    padding: 10px;
    position: absolute;
    top: 0;
    left: 0;
    color: white;
  }

  #rasterCanvas {
    display: none;
  }

  #rasterCanvasBlocks {
    display: none;
  }

  .bands {
    margin: 15px 0 15px 50px;
  }

  .map-layout {
    position: relative;
  }
  .map-layout * {
    position: absolute;
  }

  #filters {
    width: 350px;
    display: none;
    height: 100%;
  }

  button {
    display: none;
  }

  @media(max-width: 678px) {
    #filters {
      position: absolute;
      top: 0;
      left: -360px;
      transition: left 200ms linear;
      z-index: 100;
    }
    #filters[open] {
      left: 0;
    }
    button {
      display: inline-block;
    }
  }
</style>  

<div style="display: flex; height: 100%;">
  <div id="filters" ?open="${this.infoOpen}">
    <app-info-bar @close="${this._onInfoClose}" >
      <app-histogram-slider 
        id="histogram"
        .data=${this.histogram}
        @bounds-change="${this._onHistogramBoundsChange}" 
        slot="histogram">
      </app-histogram-slider>
    </app-info-bar>
  </div>

  <div class="layout">
    <button ?hidden="${this.infoOpen}" @click="${this._onMenuIconClicked}"><iron-icon icon="menu"></iron-icon></button>
    <div class="map-layout" 
      id="map" 
      @mousedown="${this._onMouseDown}"
      @wheel="${this._onScroll}"
      style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
      <!-- <img src="/images/B2-goes17.jpg" 
        ?hidden="${this.imageModeEnabled}" 
        style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px" 
      /> -->
      <canvas 
        id="balancedCanvas" 
        ?hidden="${!this.imageModeEnabled}" 
        height="${this.canvasHeight}" 
        width="${this.canvasWidth}" 
        style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
      </canvas>
      <canvas 
        id="vectorCanvas" 
        height="${this.canvasHeight}" 
        width="${this.canvasWidth}" 
        style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px" 
        @click="${this._onCanvasClicked}">
      </canvas>
    </div>
  </div>
</div>

<canvas id="rasterCanvas" 
  height="${this.canvasHeight}" 
  width="${this.canvasWidth}" 
  style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
</canvas>
<div id="rasterCanvasBlocks"></div>


`;}