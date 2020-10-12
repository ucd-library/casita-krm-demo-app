import { html } from 'lit-element';
import sharedStyles from '../styles/shared'

export default function render() { 
return html`

${sharedStyles}
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
  .map-layout canvas {
    position: absolute;
    top: 0;
    left: 0;
  }

  .top-mobile, .bottom-mobile, .top-mobile-grad, .bottom-mobile-grad {
    display: none;
    left: 0;
    right: 0;
    position: absolute;
  }


  .top-mobile {
    background: rgb(0,0,0); 
    top: 0;
    height: 50px;
  }
  .top-mobile-grad {
    background: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
    top: 50px;
    height: 50px;
  }

  .bottom-mobile {
    background: rgb(0,0,0); 
    bottom: 0;
    height: 50px;
    align-items: flex-start;
    justify-content: center;
  }
  .bottom-mobile-grad { 
    background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
    bottom: 50px;
    height: 50px;
  }

  [hidden] {
    display: none !important;
  }

  @media(max-width: 800px) {
    .top-mobile, .top-mobile-grad, .bottom-mobile-grad {
      display: block;
    }
    .bottom-mobile {
      display: flex;
    }
  }

</style>  


<div class="map-layout" 
  id="map" 
  @mousedown="${this._onMouseDown}"
  @touchstart="${this._onTouchStart}"
  @wheel="${this._onScroll}"
  style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
  <canvas 
    id="balancedCanvas" 
    ?hidden="${this.imageMode !== "imagery"}" 
    height="${this.canvasHeight}" 
    width="${this.canvasWidth}" 
    style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
  </canvas>
  <canvas 
    id="rasterMaskCanvas" 
    height="${this.canvasHeight}" 
    width="${this.canvasWidth}" 
    style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
  </canvas>
  <canvas 
    id="vectorCanvas" 
    height="${this.canvasHeight}" 
    width="${this.canvasWidth}" 
    style="height: ${this.canvasHeight}px; width:${this.canvasWidth}px">
  </canvas>

  <div class="bottom-mobile" ?hidden="${!this.lowLight}">
    <div class="low-light-msg">
      Imagery may not be visible after sunset
    </div>
  </div>
  <div class="bottom-mobile-grad" ?hidden="${!this.lowLight}"></div>
  <div class="top-mobile"></div>
  <div class="top-mobile-grad"></div>
</div>
<div id="rasterCanvasBlocks"></div>

`;}