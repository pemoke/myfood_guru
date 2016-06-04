'use strict';

/// modules
const Botkit = require('botkit');
const rest = require('restler');

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
  bot.reply(message, 'Hey there, what do you feel like eating?');
});

// user says anything else
controller.hears('(.*)', 'message_received', function (bot, message) {
  let url = 'https://api.edamam.com/diet?app_id=d5933c85&app_key=58a44858bd37d448279ba6bfbced33a9&q=' + message.text;
  rest.get(url).on('complete', function(data) {
    let dataElements = [];
    let resultsCount = data.count > 10 ? 10 : data.count;
    let structuredMessage = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": dataElements
        }
      }
    };

    if (resultsCount) {
      for (let i = 0; i < resultsCount; i++) {
        dataElements.push({
          "title": data.hits[i].recipe.label,
          "subtitle": data.hits[i].recipe.source,
          "image_url": data.hits[i].recipe.image,
          "buttons": [{
            "type": "web_url",
            "url": data.hits[i].recipe.url,
            "title": "Open website"
          },
          // {
          //   "type": "postback",
          //   "title": "Postback",
          //   "payload": `Payload for ${data.hits[i].recipe.label} element in a generic bubble`,
          // }
          ],
        });
      }
      bot.reply(message, structuredMessage);
    } else {
      bot.reply(message, `Sorry, didn't find anything for: ${message.text}`);
    }

  });
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
