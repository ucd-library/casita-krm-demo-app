let style = document.createElement('style');
document.head.appendChild(style);
style.innerHTML = `
html {
  /* UCD-Colors. Not called directly in application */
  --color-blue : #022851;
  --color-blue70 : #355B85;
  --color-blue60 : #4F7094;
  --color-blue50 : #6884A3;
  --color-blue40 : #8198B2;
  --color-blue20 : #B3C1D1;
  --color-blue10 : #CDD6E0;
  --color-aggie-gold : #FFBF00;
  --color-poppy : #F18A00;
  --color-gray6 : #0F0F0F;
  --color-gray20 : #333333;
  --color-gray : #808080;
  --color-gray70 : #B3B3B3; 
  --color-white : #FFFFFF;
  --color-rec-pool : #6FCFEB;
  --color-sunflower : #FFDC00;
  --color-farmers-market : #AADA91;
  --color-thiebaud-icing : #F095CD;
  --color-rose : #FF8189;
  --color-putah-creek : #008EAA;
  --color-double-decker : #C10230;
  --color-green : #7ab384;

  /* Theme colors called throughout application.  */
  --tcolor-primary : var(--color-aggie-gold);
  --tcolor-secondary : var(--color-blue40);

  --tcolor-text : var(--color-white);

  --tcolor-bg : var(--color-gray20);



  --tcolor-bg-primary : var(--color-blue10);
  --tcolor-hero-film : linear-gradient(rgba(2, 40, 81, 0.8), rgba(2, 40, 81, 0.8));
  --tcolor-hover-bg : var(--color-putah-creek);
  --tcolor-hover-text : var(--color-white);
  --tcolor-link-text : var(--color-blue70);
  --tcolor-link-disabled-text : var(--color-black60);
  --tcolor-link-hover-text : var(--color-putah-creek);
  --tcolor-block-bg : var(--color-white);
  --tcolor-accent0 : var(--color-rec-pool);
  --tcolor-accent1 : var(--color-sunflower);
  --tcolor-accent2 : var(--color-farmers-market);
  --tcolor-accent3 : var(--color-thiebaud-icing);
  --tcolor-accent4 : var(--color-rose);
  --tcolor-accent5 : var(--color-blue20);
  --tcolor-code-text : var(--color-blue );
  --tcolor-placeholder-text : var(--color-black60);
  --tcolor-code-bg : var(--color-black10 );
  --tcolor-border : var(--color-blue20);

  /* Theme font variables */
  --font-size : 16px;
  --font-size-h1 : 18px;
  --font-size-h2 : 14px;
  --font-size-h3 : 13px;
  --font-size-small : 14px;

  --font-weight-normal : 400;
  --font-weight-bold : 600;
  --font-weight-extra-bold : 900;

  /* Misc. theme variables */
  --hr-color : var(--color-blue20);
  --hr-color-light : var(--color-blue10);
  --hr-weight : 1px;
  --masthead-height: 50px;
  --masthead-logo-height: 20px;
}
body, html {
  font-family      : proxima-nova,"Lucida Grande","Lucida Sans","Helvetica Neue",Helvetica,Arial,sans-serif;
  font-size        : var(--font-size);
  font-weight      : var(--font-weight-normal);
  line-height      : calc(var(--font-size) * 1.4);
  margin           : 0;
  padding          : 0;
  background-color : var(--tcolor-bg);
  color            : var(--tcolor-text);
  max-width        : 100vw;
}
`;