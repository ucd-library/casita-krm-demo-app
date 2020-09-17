import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
  }
  #rasterCanvasBlocks {
    display: none;
  }

  .map-layout {
    position: relative;
  }
  .map-layout * {
    position: absolute;
    top: 0;
    left: 0;
  }

</style>  


<div class="map-layout" 
  id="map" 
  @mousedown="${this._onMouseDown}"
  @wheel="${this._onScroll}"
  style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
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
<div id="rasterCanvasBlocks"></div>

`;}