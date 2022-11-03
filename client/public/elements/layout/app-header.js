import { LitElement } from 'lit-element';
import render from "./app-header.tpl.js"


export default class AppHeader extends LitElement {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

  _onAboutClicked() {
    this.shadowRoot.querySelector('#about').style.display = 'block';
  }

  _onCloseClicked() {
    this.shadowRoot.querySelector('#about').style.display = 'none';
  }

}

customElements.define('app-header', AppHeader);
