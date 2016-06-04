'use strict';

// modules
const fbMessengerHandler = require('../controllers/botkit_fb_messenger').handler;

// variables
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

// routes
module.exports = (app) => {
  app.get('/webhook', (req, res) => {
    if (!FB_VERIFY_TOKEN) {
      throw new Error('missing FB_VERIFY_TOKEN');
    }

    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
      res.send(req.query['hub.challenge']);
    } else {
      res.send("Verify token is incorrect");
      res.sendStatus(400);
    }
  });

  app.post('/webhook', (req, res) => {
    // parsing the Messenger API response
    fbMessengerHandler(req.body);
    res.sendStatus(200);
  });
};
