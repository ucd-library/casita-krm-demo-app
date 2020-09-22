const app = require('express')();
const config = require('./lib/config');

require('./controllers/static')(app);

app.listen(config.server.port, () => console.log('goes-r demo webapp listening on port: '+config.server.port));