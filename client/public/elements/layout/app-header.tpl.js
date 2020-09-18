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
    display: flex;
    align-items: center;
  }
  h1 {
    margin-left: 15px;
    flex: 1;
  }
  img {
    margin-right: 15px
  }
  img[sm] {
    display: none;
    height: 34px;
  }

  @media(max-width: 450px) {
    img[sm] {
      display: block;
    }
    img[full] {
      display: none;
    }
  }

</style>  

<div style="flex:1">
  <h1>GOES-R Real Time Data</h1>
  <a href="https://library.ucdavis.edu" target="_blank">
    <img src="/images/ucd-lib-logo-full.png" full />
    <img src="/images/ucd-lib-logo-sm.svg" sm />
  </a>
</div>

`;}