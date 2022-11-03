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
  .main {
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

  a, a:visited {
    color: var(--color-rec-pool);
  }

  .about {
    vertical-align: bottom;
    display: inline-block;
    cursor: pointer;
  }

  #about {
    display: none;
    position: absolute;
    top : 0;
    left : 0;
    right: 0;
    bottom: 0;
    z-index: 5000;
    height: 100vh;
    background-color: rgba(51,51,51, 0.65);
  }

  .layout {
    position: absolute;
    top : 0;
    left : 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .main-panel {
    background-color: var(--color-gray6);
    padding: 8px;
    max-width: 600px;
    margin: 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }

  .close-panel {
    display: flex;
    align-items: center;
    height: 40px;
    text-align: right;
    flex-direction: row-reverse;
  }

  .close-panel iron-icon {
    cursor: pointer;
    color: var(--tcolor-secondary);
  }

  .content-panel {
    padding: 0 32px 32px 32px;
    overflow-y: auto;
  }


  @media(max-width: 450px) {
    img[sm] {
      display: block;
    }
    [full] {
      display: none;
    }
  }

</style>  

<div class="main" style="flex:1">
  <h1>
    CaSITA <span full>- GOES-R Real Time Data</span>
    <iron-icon icon="info-outline" class="about" @click="${this._onAboutClicked}"></iron-icon>
  </h1>
  <a href="https://library.ucdavis.edu" target="_blank">
    <img src="/images/ucd-lib-logo-full.png" full />
    <img src="/images/ucd-lib-logo-sm.svg" sm />
  </a>
</div>

<div id="about">
  <div class="layout">
    <div class="main-panel">
      <div class="close-panel">
        <iron-icon icon="close" @click="${this._onCloseClicked}" tabindex="1"></iron-icon>
      </div>

      <div class="content-panel">
        <h2>About CaSITA</h2>
        <p>CaSITA is a real time data stream of the <a href="https://www.goes-r.gov/">GOES-R satellite.</a></a></p>
        <h3>Sponsors</h3>
        <p>
          <ul>
            <li><a href="https://library.ucdavis.edu">University of California, Davis, Library</a></li>
            <li>UCOP Lab Fees project (award LFR-20-651032)</li>
          </ul>
        </p>
        <h3>Development Team</h3>
        <p>
          <ul>
            <li><a href="https://library.ucdavis.edu/person/justin-merz/">Justin Merz</a> - <a href="https://library.ucdavis.edu">UCD Library</a> - <a href="https://library.ucdavis.edu/online-strategy/">Digitial Applications</a></li>
            <li><a href="https://library.ucdavis.edu/person/quinn-hart/">Quinn Hart</a> - <a href="https://library.ucdavis.edu">UCD Library</a> - <a href="https://library.ucdavis.edu/online-strategy/">Digitial Applications</a></li>
            <li><a href="https://library.ucdavis.edu/person/kimmy-hescock/">Kimmy Hescock</a> - <a href="https://library.ucdavis.edu">UCD Library</a> - <a href="https://library.ucdavis.edu/online-strategy/">Digitial Applications</a></li>
            <li><a href="https://cstars.ucdavis.edu/people/technical-staff/george-scheer/">George Sheer</a> - <a href="https://cstars.ucdavis.edu/">CSTARS</a></li>
          </ul>
        </p>
        <h3>Code</h3>
        <p>
          <ul>
            <li><a href="https://github.com/ucd-library/casita-krm-demo-app">Demo Application (this webapp)</a></li>
            <li><a href="https://github.com/ucd-library/casita-tasks">Cloud Processing</a></li>
            <li><a href="https://github.com/ucd-library/casita-deployment">Cloud Deployment</a></li>
          </ul>
        </p>
      </div>

    </div>
  </div>
</div>

`;}