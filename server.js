const app = require('express')();

require('./controllers/static')(app);


app.listen(3000, () => console.log('goes-r demo webapp listening on port: 3000'));