'use strict';

require('dotenv').config();
const express = require('express');
const routes = require('./app/routes/index');

// Webserver
const PORT = process.env.PORT || 8445;
const app = express();

app.use('/', routes);

app.listen(PORT, function() {
  console.log('listening on port ' + PORT);
});
