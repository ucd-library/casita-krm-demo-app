import { LitElement } from 'lit-element';
import render from "./app-histogram-slider.tpl.js"


export default class AppHistogramSlider extends LitElement {

  static get properties() {
    return {
      data : {type: Object},
      min : {type: Number},
      max : {type: Number},
      selectedValueLabel : {type: String}
    }
  }

  constructor() {
    super();

    this.data = {};
    this.selectedValueLabel = '';
    this.min = 5;
    this.max = 190;

    this.render = render.bind(this);
  }

  firstUpdated() {
    this.context = this.shadowRoot.querySelector('canvas').getContext('2d');
  }

  updated(props) {
    if( props.has('data') ) {
      this.redraw();
      if( this.selectedValue !== undefined ) {
        this.selectedValueLabel = this.selectedValue+'='+(this.data[this.selectedValue] || 0);
      }
    }
  }

  imageModeUpdate(mode) {
    this.imageMode = mode;
    this.imageModeUpdated = true;
  }

  redraw() {
    this.context.clearRect(0, 0, 256, 256);

    let tmp = Object.assign({}, this.data);
    if( tmp[255] ) delete tmp[255];

    let max = Math.max(... Object.values(tmp));
    if( max < 1 ) max = 1;

    if( this.imageModeUpdated && Object.keys(tmp).length > 0) {
      this.imageModeUpdated = false;

      let maxIndex = 0;
      let minIndex = 256;

      let arr = [];
      for( let key in tmp ) {
        arr.push({key: parseInt(key), value: tmp[key]});
      }

      arr.sort((a, b) => {
        if( a.key < b.key ) return -1;
        if( a.key > b.key ) return 1;
        return 0;
      });

      arr.forEach(item => {
        let t = this.fit(item.val, max);
        if( t < 252 && item.key > maxIndex ) maxIndex = item.key;
        if( t < 252 && item.key < minIndex ) minIndex = item.key;
      });

      console.log(arr);

      let def = APP_CONFIG.imageProduct[this.imageMode];
      
      console.log(minIndex , maxIndex, def.histoMinMax);

      if( def && def.histoMinMax ) {
        if( minIndex < def.histoMinMax[0] ) minIndex = def.histoMinMax[0];
        if( maxIndex > def.histoMinMax[1] ) maxIndex = def.histoMinMax[1];
      }

      this.min = minIndex;
      this.max = maxIndex;

      this.dispatchEvent(new CustomEvent('bounds-change', {detail: {
        min : this.min,
        max : this.max
      }}));
    }

    for( let i = 0; i < 256; i++ ) {
      if( this.data[i] !== undefined ) {
        if( i < this.min || i > this.max ) {
          this.context.fillStyle = '#444';
        } else {
          this.context.fillStyle = 'white';
        }
        this.context.fillRect(i, 256-this.fit(this.data[i+''], max), 1, 256);
      }

      if( i === this.min ) {
        this.context.fillStyle = 'yellow';
        this.context.fillRect(i, 0, 1, 256);
      }
      if( i === this.max ) {
        this.context.fillStyle = 'yellow';
        this.context.fillRect(i, 0, 1, 256);
      }
      
      if( i === this.selectedValue ) {
        this.context.fillStyle = 'red';
        this.context.fillRect(i, 0, 1, 256);
      }
    }
  }

  fit(val=0, max) {
    val = Math.round((val / max) * 256); 
    if( val > 256 ) return 256;
    return val;
  }

  _onBondsChange(e) {
    let type = e.currentTarget.id;
    this[type] = parseInt(e.currentTarget.value);
    this.redraw();

    this.dispatchEvent(new CustomEvent('bounds-change', {detail: {
      min : this.min,
      max : this.max
    }}));
  }

  _onClick(e) {
    this._showSelected(e);
  }

  _showSelected(e) {
    let x = e.x - this.shadowRoot.querySelector('canvas').offsetLeft;
    this.selectedValue = x;
    this.selectedValueLabel = x+'='+(this.data[x] || 0);
    this.redraw();
  }

}

customElements.define('app-histogram-slider', AppHistogramSlider);
