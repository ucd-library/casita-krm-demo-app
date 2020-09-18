import { LitElement } from 'lit-element';
import render from "./app-image-view-selector.tpl.js"

import b64CaIcon from "../../images/casita-california.svg";
import b64GIcon from "../../images/casita-globe.svg";

let caIcon = b64CaIcon;
caIcon = atob(caIcon.replace('data:image/svg+xml;base64,', ''));
let globeIcon = b64GIcon;
globeIcon = atob(globeIcon.replace('data:image/svg+xml;base64,', ''));


const VIEWS = [
  {mode: 'imagery', view: 'ca', label: 'Live Image', icon: caIcon},
  {mode: 'imagery', view: 'world', label: 'Live Image', icon: globeIcon, active: true},
  {mode: 'grid', label: 'Grid Only', icon: globeIcon}
]

export default class AppImageViewSelector extends Mixin(LitElement) 
  .with(LitCorkUtils) {

  static get properties() {
    return {
      views : {type: Array},
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.views = VIEWS;

    this._injectModel('ImageModel', 'AppStateModel');
  }

  _onButtonClicked(e) {
    let selectedIndex = parseInt(e.currentTarget.getAttribute('index'));
    this.views.forEach((btn, index) => {
      btn.active = (selectedIndex === index)
    });

    this.requestUpdate();

    let activeBtn = this.views[selectedIndex];

    let opts = {imageMode: activeBtn.mode};
    if( activeBtn.view ) {
      opts.view = activeBtn.view
    }

    if( opts.imageMode === 'grid' ) {
      opts.gridModeEnabled = true;
      opts.labelModeEnabled = true;
    }

    this.AppStateModel.set(opts);
  }

}

customElements.define('app-image-view-selector', AppImageViewSelector);
