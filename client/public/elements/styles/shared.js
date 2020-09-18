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

  .color-balance {
    font-size: 13px;
    font-weight: var(--font-weight);
    color: var(--tcolor-text);
  }
</style>
`;