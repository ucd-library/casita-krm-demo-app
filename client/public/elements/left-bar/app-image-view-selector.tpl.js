import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
  }

  button {
    background-color: transparent;
    width: 90px;
    height: 90px;
    padding: 6px;
    font-size: 13px;
    border-radius: 0;
    border: 1px solid var(--tcolor-secondary);
    color: var(--tcolor-secondary);
    margin: 0 6px 0 0;
    cursor: pointer;
    display: inline-block;
    text-transform: uppercase;
  }

  button[active] {
    border: 1px solid var(--tcolor-primary);
    color: var(--tcolor-primary);
  }

  button svg {
    width: 50px;
    height: 50px;
    fill: var(--tcolor-secondary);
  }

  button[active] svg {
    fill: var(--tcolor-primary);
  }

  button .img-border {
    margin-bottom: 6px;
  }

  button:last-of-type {
    padding-right: 0;
  }
</style>

${this.views.map((view, index) => html`
    <button ?active=${view.active} @click="${this._onButtonClicked}" index="${index}">
      <div class="img-border">
        ${html([view.icon])}
      </div>
      <div>${view.label}</div>
    </button>
  `)}
`;}