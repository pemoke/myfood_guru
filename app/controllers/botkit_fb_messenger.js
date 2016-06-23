'use strict';

/// modules
const Botkit = require('botkit');
const rest = require('restler');
const request = require('request');

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
  verify_token: FB_VERIFY_TOKEN
});

const bot = controller.spawn({});

//subscribe to page events
request.post('https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=' + FB_PAGE_TOKEN,
    function(err, res, body) {
      if (err) {
        controller.log('Could not subscribe to page messages');
      }
      else {
        controller.log('Successfully subscribed to Facebook events:', body);
        console.log('Botkit activated')

        //start ticking to send conversation messages
        controller.startTicking()
      }
});

// user said hello
controller.hears(['hello'], 'message_received', function(bot, message) {

  bot.reply(message, 'Hey there.');

});

controller.hears(['cookies'], 'message_received', function(bot, message) {

  bot.startConversation(message, function(err, convo) {

    convo.say('Did someone say cookies!?!!');
    convo.ask('What is your favorite type of cookie?', function(response, convo) {
      convo.say('Golly, I love ' + response.text + ' too!!!');
      convo.next();
    });
  });
});


// user said hello
controller.hears(['hi'], 'message_received', function (bot, message) {
  bot.reply(message, 'Hey there, what do you feel like eating?');
});


// user diet preference
controller.hears(['diet'], 'message_received', function(bot, message) {

  controller.storage.users.get(message.user, function(err, user) {
    let diet = 'all';
    if (user && user.diet) diet = user.diet;
    bot.reply(message, 'Your prefered diet is ' + diet);

    bot.startConversation(message, function (err, convo) {
      if (!err) {
        convo.ask('Would you like to change it?', [
          {
            pattern: bot.utterances.yes,
            callback: function(response, convo) {
              convo.ask('What is your diet preference?', [
                {
                  pattern: new RegExp(/^(all|high-protein|low-carb|low-fat|low-fat-abs|balanced|high-fiber|low-sodium)/i),
                  callback: function(response, convo) {
                    convo.next();
                  }
                },
                {
                  pattern: 'nevermind',
                  callback: function(response, convo) {
                    convo.stop();
                  }
                },
                {
                  default: true,
                  callback: function(response, convo) {
                    convo.say('Please choose all or: high-protein, low-carb, low-fat, low-fat-abs, balanced, high-fiber, low-sodium');
                    convo.say('Or say nevermind if you do not want to change');
                    convo.repeat();
                    convo.next();
                  }
                }
              ], {'key': 'dietname'});
              convo.next();
            }
          },
          {
            pattern: bot.utterances.no,
            callback: function(response, convo) {
              convo.stop();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              convo.repeat();
              convo.next();
            }
          }
        ]);
      }

      convo.on('end', function(convo) {
        if (convo.status == 'completed') {
          controller.storage.users.get(message.user, function(err, user) {
            if (!user) {
              user = {
                id: message.user,
              };
            }
            user.diet = convo.extractResponse('dietname').toLowerCase();
            controller.storage.users.save(user, function(err, id) {
              bot.reply(message, 'Got it. I will search meals based on ' + user.diet + ' from now on.');
            });
          });
        } else {
          bot.reply(message, 'OK, nevermind!');
        }
      });

    });

  });

});


// user health preference
controller.hears(['health'], 'message_received', function(bot, message) {

  controller.storage.users.get(message.user, function(err, user) {
    let health = 'all';
    if (user && user.health) health = user.health;
    bot.reply(message, 'Your prefered health is ' + health);

    bot.startConversation(message, function (err, convo) {
      if (!err) {
        convo.ask('Would you like to change it?', [
          {
            pattern: bot.utterances.yes,
            callback: function(response, convo) {
              convo.ask('What is your health preference?', [
                {
                  pattern: new RegExp(/^(all|low-sugar|sugar-conscious|gluten-free|vegetarians|vegan|paleo|wheat-free|dairy-free|egg-free|soy-free|fish-free|shellfish-free|tree-nut-free|low-potassium|alcohol-free|No-oil-added|kidney-friendly|peanut-free|alcohol-free)/i),
                  callback: function(response, convo) {
                    convo.next();
                  }
                },
                {
                  pattern: 'nevermind',
                  callback: function(response, convo) {
                    convo.stop();
                  }
                },
                {
                  default: true,
                  callback: function(response, convo) {
                    convo.say('Please choose: all or low-sugar, sugar-conscious, gluten-free, vegetarian, vegan, paleo, wheat-free, dairy-free, egg-free, soy-free, fish-free, shellfish-free, tree-nut-free, low-potassium, alcohol-free, No-oil-added, kidney-friendly, peanut-free, alcohol-free');
                    convo.say('Or say nevermind if you do not want to change');
                    convo.repeat();
                    convo.next();
                  }
                }
              ], {'key': 'healthname'});
              convo.next();
            }
          },
          {
            pattern: bot.utterances.no,
            callback: function(response, convo) {
              convo.stop();
            }
          },
          {
            default: true,
            callback: function(response, convo) {
              convo.repeat();
              convo.next();
            }
          }
        ]);
      }

      convo.on('end', function(convo) {
        if (convo.status == 'completed') {
          controller.storage.users.get(message.user, function(err, user) {
            if (!user) {
              user = {
                id: message.user,
              };
            }
            user.health = convo.extractResponse('healthname').toLowerCase();
            controller.storage.users.save(user, function(err, id) {
              bot.reply(message, 'From now on, I will search meals suited for ' + user.health + ' health');
            });
          });
        } else {
          bot.reply(message, 'OK, nevermind!');
        }
      });

    });

  });

});


// user says anything else
controller.hears('(.*)', 'message_received', function (bot, message) {
  let prefDiet = '';
  let prefHealth = '';

  controller.storage.users.get(message.user, function(err, user) {
    if (!err && user.diet && user.diet != 'all') prefDiet = '&diet=' + user.diet;
    if (!err && user.health  && user.health != 'all') prefHealth = '&health=' + user.health;
  });


  let url = `https://api.edamam.com/diet?app_id=d5933c85&app_key=58a44858bd37d448279ba6bfbced33a9&q=${message.text}${prefDiet}${prefHealth}`;

  console.log(url);

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
