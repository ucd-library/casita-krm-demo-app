import { LitElement } from 'lit-element';
import render from "./app-histogram-slider.tpl.js"


export default class AppHistogramSlider extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      histogramHeight : {type: Number},
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

    this.histogramHeight = 100;
    this.min = 5;
    this.max = 190;

    this.render = render.bind(this);

    window.addEventListener('mouseup', () => this._onMouseUp());
    window.addEventListener('mouseout', () => this._onMouseUp());
    window.addEventListener('mousemove', e => this._onMouseMove(e));
    window.addEventListener('touchmove', e => this._onTouchMove(e));
    window.addEventListener('touchend', e => this._onMouseUp());
    window.addEventListener('touchcancel', e => this._onMouseUp());

    this._injectModel('ImageModel');
  }

  firstUpdated() {
    this.context = this.shadowRoot.querySelector('canvas').getContext('2d');
    this.redraw();
  }

  updated(props) {
    if( props.has('data') && this.data ) {
      this.redraw();
      if( this.selectedValue !== undefined ) {
        this.selectedValueLabel = this.selectedValue+'='+(this.data[this.selectedValue] || 0);
      }
    }
  }

  _onImageHistogramUpdate(e) {
    this.data = e.data;
  }

  _onSliderMouseDown(e) {
    this.sliderAdjusting = {
      type: e.currentTarget.id,
      startX: e.clientX,
      startVal : e.currentTarget.id === 'min' ? this.min : this.max
    };
  }

  _onTouchStart(e) {
    this.sliderAdjusting = {
      type: e.currentTarget.id,
      startX: e.touches[0].clientX,
      startVal : e.currentTarget.id === 'min' ? this.min : this.max
    };
  }

  _onTouchMove(e) {
    this._onMouseMove(e.touches[0]);
  }

  _onMouseMove(e) {
    if( !this.sliderAdjusting ) return;
    this.sliderAdjusting.current = e.clientX;

    let diff = this.sliderAdjusting.startX - e.clientX;
    
    if( this.sliderAdjusting.type === 'min' ) {
      let val = this.sliderAdjusting.startVal - diff;
      if( val < 0 ) val = 0;
      if( val >= this.max ) val = this.max-1;
      this.min = Math.floor(val);
    } else {
      let val = this.sliderAdjusting.startVal - diff;
      if( val > 256 ) val = 256;
      if( val <= this.min ) val = this.min+1;
      this.max = Math.floor(val);
    }

    this.redraw();
  }

  _onMouseUp() {
    if( !this.sliderAdjusting ) return;
    this.setAbsValues();
  }

  setAbsValues() {
    this.sliderAdjusting = null;
    this.ImageModel.setHistogramAbsMinMax(this.min, this.max);
  }

  redraw() {
    if( !this.data ) return;

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
        this.context.fillRect(i, this.histogramHeight-this.fit(this.data[i+''], max), 1, this.histogramHeight);
      }

      if( i === this.min ) {
        this.context.fillStyle = 'yellow';
        this.context.fillRect(i, 0, 1, this.histogramHeight);
      }
      if( i === this.max ) {
        this.context.fillStyle = 'yellow';
        this.context.fillRect(i, 0, 1, this.histogramHeight);
      }
      
      // if( i === this.selectedValue ) {
      //   this.context.fillStyle = 'red';
      //   this.context.fillRect(i, 0, 1, this.histogramHeight);
      // }
    }
  }

  fit(val=0, max) {
    val = Math.round((val / max) * this.histogramHeight); 
    if( val > this.histogramHeight ) return this.histogramHeight;
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
}

customElements.define('app-histogram-slider', AppHistogramSlider);
