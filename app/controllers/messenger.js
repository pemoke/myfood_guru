'use strict';

const request = require('request');

// Messenger API parameters
const FB_PAGE_ID = process.env.FB_PAGE_ID;
if (!FB_PAGE_ID) {
  throw new Error('missing FB_PAGE_ID');
}

const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN');
}


// See the Webhook reference
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
const getFirstMessagingEntry = (body) => {
  const val = body.object == 'page' &&
          body.entry &&
          Array.isArray(body.entry) &&
          body.entry.length > 0 &&
          body.entry[0] &&
          body.entry[0].id === FB_PAGE_ID &&
          body.entry[0].messaging &&
          Array.isArray(body.entry[0].messaging) &&
          body.entry[0].messaging.length > 0 &&
          body.entry[0].messaging[0]
      ;
  return val || null;
};


// Messenger API specific code
// See the Send API reference
// https://developers.facebook.com/docs/messenger-platform/send-api-reference
const fbReq = request.defaults({
  uri: 'https://graph.facebook.com/me/messages',
  method: 'POST',
  json: true,
  qs: { access_token: FB_PAGE_TOKEN },
  headers: {'Content-Type': 'application/json'},
});

const fbMessage = (recipientId, msg, cb) => {
  const opts = {
    form: {
      recipient: {
        id: recipientId,
      },
      message: {
        text: msg,
      },
    },
  };
  fbReq(opts, (err, resp, data) => {
    if (cb) {
      cb(err || data.error && data.error.message, data);
    }
  });
};


module.exports = (req) => {
  // Parsing the Messenger API response
  const messaging = getFirstMessagingEntry(req.body);
  if (messaging && messaging.message && messaging.recipient.id === FB_PAGE_ID) {
    // Yay! We got a new message!

    // We retrieve the Facebook user ID of the sender
    const sender = messaging.sender.id;

    // We retrieve the message content
    const msg = messaging.message.text;
    const atts = messaging.message.attachments;

    if (atts) {
      // We received an attachment

      // Let's reply with an automatic message
      fbMessage(
          sender,
          'Sorry I can only process text messages for now.'
      );
    } else if (msg) {
      // We received a text message

      // Let's forward the message to the Wit.ai Bot Engine
      // This will run all actions until our bot has nothing left to do
      fbMessage(
          sender,
          'You said: ' + msg
      );
    }
  }
};
