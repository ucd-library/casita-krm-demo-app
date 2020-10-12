import { html } from 'lit-element';
import sharedStyles from './styles/shared'

export default function render() { 
return html`

${sharedStyles}
<style>
  :host {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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

  .left-bar-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;

    background: rgb(0, 0, 0);
    width: 375px;
    background: linear-gradient(
      90deg, 
      rgba(0,0,0,1) 0%, 
      rgba(0,0,0,0.3) 89%,
      rgba(0,0,0,0) 100%
    );
    overflow-y: auto;
  }

  app-left-bar {
    padding: 18px 36px 18px 18px;
  }

  .nav-panel {
    position: absolute;
    display: none;
    top: 0;
    left: 0;
    z-index: 50;
  }

  button.nav[open] {
    box-shadow: none;
    margin: 14px 0 0 14px;
    padding: 0 15px 0 13px
  }
  button.nav[open] iron-icon {
    vertical-align: middle;
  }

  button.nav[close] {
    padding-right: 13px;
  }

  .low-light-msg {
    position: absolute;
    top: 18px;
    right: 18px;
  }

  .nav-return-panel {
    padding: 14px 14px 2px 14px;
    background: rgb(0, 0, 0);
    width: 375px;
    background: linear-gradient(
      90deg, 
      rgba(0,0,0,1) 0%, 
      rgba(0,0,0,0.3) 89%,
      rgba(0,0,0,0) 100%
    );
    box-sizing: border-box;
  }

  iron-icon {
    color: var(--tcolor-primary);
  }

  @media(max-width: 800px) {
    .nav-panel {
      display: block;
    }
    .left-bar-container {
      top: 51px;
      display: none;
    }
    .left-bar-container[open] {
      display: block;
    }
    .low-light-msg {
      display: none;
    }
  }

  [mobile-debug] {
    position: absolute;
    top : 0;
    left: 0;
    right: 0;
    background: black;
    color: white;
    z-index: 10000;
  }

</style>  

<!-- <div mobile-debug id="debug"></div> -->
<div class="layout">
  <app-header></app-header>
  <div class="main">
    
    <div class="nav-panel">
      <button class="nav" open ?hidden="${this.showNav}" @click="${this._onNavClicked}">
        <iron-icon icon="dashboard"></iron-icon> Dashboard
      </button>
      <div class="nav-return-panel" ?hidden="${!this.showNav}" >
        <button class="nav" close @click="${this._onNavClicked}">
          <iron-icon icon="chevron-left"></iron-icon> Return to Map&nbsp;
        </button>
      </div>
    </div>

    <div class="left-bar-container" ?open="${this.showNav}">
      <app-left-bar ?open="${this.showNav}"></app-left-bar>
    </div>
    

    <app-canvas-map id="canvas"></app-canvas-map>

    <div ?hidden="${!this.lowLight}" class="low-light-msg">
      Imagery may not be visible after sunset
    </div>
  </div>
</div>
`;}