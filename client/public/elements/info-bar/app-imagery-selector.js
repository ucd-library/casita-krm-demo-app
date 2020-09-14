import { LitElement } from 'lit-element';
import render from "./app-imagery-selector.tpl.js"

export default class AppImagerySelector extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      buttonGroups : {type: Array}
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this._injectModel('AppStateModel');

    this._init();
  }

  _init() {
    let groups = [];

    let products = APP_CONFIG.imageProduct;
    let bands = {};
    for( let key in products ) {
      let product = products[key];
      if( !bands[product.band] ) {
        
        let description;
        if( key === 'boundary' ) {
          description = 'Bounding boxes only, no live imagery.  Saves Bandwidth';
        } else {
          description = 'Live imagery of band '+product.band;
        }

        bands[product.band] = {
          label : product.band ? 'Band '+product.band : product.label,
          description : description,
          buttons : []
        }
      }

      bands[product.band].buttons.push({
        label : product.label,
        selected : false,
        mode : key
      });
    }

    this.buttonGroups = groups.concat(Object.values(bands));
  }

  _onAppStateUpdate(e) {
    this._updateSelectedBtn(e.mode);
  }

  _onBtnClicked(e) {
    let mode = e.currentTarget.getAttribute('mode');
    this.AppStateModel.set({mode});
  }

  _updateSelectedBtn(mode) {
    for( let group of this.buttonGroups ) {
      for( let btn of group.buttons ) {
        btn.selected = btn.mode === mode;
      } 
    }
    this.requestUpdate();
  }

}

customElements.define('app-imagery-selector', AppImagerySelector);
