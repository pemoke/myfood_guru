'use strict';

// modules
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const express = require('express');
const routes = require('./app/routes/index');

// variables
const app = express();
const PORT = process.env.PORT || 8445;

// load environment variables, either from .env files (dev), or cloud env...
dotenv.load();

// parsing
app.use(bodyParser.json()); // for parsing application/json

// routing
routes(app);

// webserver
app.listen(PORT, function() {
  console.log('listening on port ' + PORT);
});
