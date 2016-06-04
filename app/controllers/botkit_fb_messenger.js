'use strict';

/// modules
const Botkit = require('botkit');

// messenger API parameters
const FB_PAGE_ID = process.env.FB_PAGE_ID;
if (!FB_PAGE_ID) {
  throw new Error('missing FB_PAGE_ID');
}

const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
if (!FB_PAGE_TOKEN) {
  throw new Error('missing FB_PAGE_TOKEN');
}

const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;


const controller = Botkit.facebookbot({
  debug: true,
  access_token: FB_PAGE_TOKEN,
  verify_token: FB_VERIFY_TOKEN,
});

const bot = controller.spawn({});


// user said hello
controller.hears(['hi'], 'message_received', function (bot, message) {
  bot.reply(message, 'Hey there.');
});


// logic
const processMessage = (fbMsg) => {
  // We retrieve the message content
  const msg = {
    text: fbMsg.message.text,
    user: fbMsg.sender.id,
    channel: fbMsg.sender.id,
    timestamp: fbMsg.timestamp,
    seq: fbMsg.message.seq,
    mid: fbMsg.message.mid,
    attachments: fbMsg.message.attachments
  };

  controller.receiveMessage(bot, msg);
};

const handler = (obj) => {
  if (obj.entry) {
    for (let e = 0; e < obj.entry.length; e++) {
      for (let m = 0; m < obj.entry[e].messaging.length; m++) {
        let fbMsg = obj.entry[e].messaging[m];

        // normal message
        if (fbMsg && fbMsg.message && fbMsg.recipient.id === FB_PAGE_ID) {
          controller.debug('message', fbMsg.message);
          processMessage(fbMsg);
        }
        // clicks on a postback action in an attachment
        else if (fbMsg && fbMsg.postback && fbMsg.recipient.id === FB_PAGE_ID) {
          controller.debug('postback', fbMsg.postback);
        }
        // when a user clicks on "Send to Messenger"
        else if (fbMsg && fbMsg.optin && fbMsg.recipient.id === FB_PAGE_ID) {
          controller.debug('optin', fbMsg.optin);
        }
        // message delivered callback
        else if (fbMsg && fbMsg.delivery && fbMsg.recipient.id === FB_PAGE_ID) {
          controller.debug('delivery', fbMsg.delivery);
        }
        else {
          controller.debug('Unexpected message from Facebook: ', fbMsg)
        }
      }
    }
  }
};

exports.handler = handler;
