'use strict';

const express = require('express');
const router = express.Router();

const botkit = require('../controllers/botkit');

const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN');
}

const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;


router.get('/', function (req, res) {
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

module.exports = router;
