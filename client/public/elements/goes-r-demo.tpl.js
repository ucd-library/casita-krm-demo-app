import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
    height: 100vh;
  }
</style>  

<simple-product-canvas id="canvas"></simple-product-canvas>
`;}