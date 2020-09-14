import { html } from 'lit-element';

export default function render() { 
return html`

<style>
  :host {
    display: block;
  }

  .button-group {
    margin-bottom: 10px;
    padding: 5px;
  }

  h2 {
    margin-bottom: 3px;
  }

  .description {
    margin-bottom: 8px;
    font-size: 12px;
    color: #ccc;
  }

  .button-group button {
    cursor: pointer;
    background-color: black;
    color: white;
    padding: 8px;
    font-size: 14px;
    border: 1px solid white;
    border-radius: 3px;
  }
  .button-group button[selected] {
    color: yellow;
    border: 1px solid yellow;
  }
  .button-group button:hover {
    background-color: #333;
  }
</style>  

${this.buttonGroups.map(group => html`
  <div class="button-group">
    <h2>${group.label}</h2>
    <div class="description">${group.description}</div>
    <div>
      ${group.buttons.map(btn => html`
        <button 
          ?selected="${btn.selected}" 
          @click="${this._onBtnClicked}"
          mode="${btn.mode}">${btn.label}</button>
      `)}
    </div>
  </div>
`)}

`;}