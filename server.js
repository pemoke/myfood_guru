'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const routes = require('./app/routes/index');

// Webserver
const PORT = process.env.PORT || 8445;
const app = express();

app.use('/', routes);
app.use(bodyParser.json());

app.listen(PORT, function() {
  console.log('listening on port ' + PORT);
});
