'use strict';

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const express = require('express');
const router = express.Router();

const messengerController = require('../controllers/messenger');
const botkitController = require('../controllers/botkit');

const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;


router.get('/', (req, res) => {
  if (!FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
  }

  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

router.post('/', jsonParser, (req, res) => {
  // Parsing the Messenger API response
  messengerController(req);
  res.sendStatus(200);
});

module.exports = router;
