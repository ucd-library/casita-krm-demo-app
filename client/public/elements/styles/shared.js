import { html } from 'lit-element';

export default html`
<style>
  h1 {
    margin: 0;
    padding: 0;
    font-size: var(--font-size-h1);
    font-weight: var(--font-weight-bold);
    text-transform: capitalize;
    color: var(--tcolor-text);
  }

  h2 {
    margin: 0 0 5px 0;
    padding: 0;
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-extra-bold);
    text-transform: uppercase;
    color: var(--tcolor-primary);
    line-height: 18px;
  }

  h3 {
    margin: 5px 0;
    padding: 0;
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-extra-bold);
    text-transform: capitalize;
    color: var(--tcolor-secondary);
  }

  p {
    margin: 0;
    padding: 0;
    font-weight: var(--font-weight);
    font-size: var(--font-size);
    color: var(--tcolor-text);
  }

  .text-gray {
    font-size: 14px;
    font-weight: var(--font-weight);
    color: var(--color-gray70);
  }

  .color-balance {
    font-size: 13px;
    font-weight: var(--font-weight);
    color: var(--tcolor-text);
  }

  button.nav {
    height: 35px;
    border-radius: 35px;
    border: none;
    color: white;
    box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.8);
    background-color: var(--color-gray20);
  }
</style>
`;