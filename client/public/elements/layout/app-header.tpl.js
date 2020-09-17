import { html } from 'lit-element';
import sharedStyles from '../styles/shared'

export default function render() { 
return html`

${sharedStyles}
<style>
  :host {
    display: block;
    height: 50px;
    background-image: url('/images/rainbow-bar.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
  div {
    height: 50px;
  }
  h1 {
    padding: 11px 0 0 11px;
  }
</style>  

<div>
  <h1>GOES-R Real Time Data</h1>
</div>

`;}