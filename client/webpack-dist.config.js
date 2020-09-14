let config = require('@ucd-lib/cork-app-build').dist({
  root : __dirname,
  entry : 'public/elements/goes-r-demo.js',
  dist : 'dist/js',
  clientModules : 'public/node_modules'
});

module.exports = config;