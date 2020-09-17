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
    height: 100%;
    flex-direction: column;
  }

  .main {
    flex: 1;
    position: relative;
  }

  app-left-bar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
  }
</style>  

<div class="layout">
  <app-header></app-header>
  <div class="main">
    <app-left-bar></app-left-bar>

    <app-canvas-map id="canvas"></app-canvas-map>
  </div>
</div>
`;}