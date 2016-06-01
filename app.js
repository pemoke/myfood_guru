var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var request = require('request');
var bodyParser = require('body-parser');

var token = "EAAW2QkrRUoMBANZAd0KnDTxJNrtujz3pZC4cxTWqHXhWEXSp1bN0vRxXclOI095VC106L3JYJAuFNbPFTvT2HUis7SfxKi9KFMbcB0xPlASwkGFUC3HZCvq47sH0lwYf7Kc7NRJBqYHQHoZByWVWkYkEn692BnZAkG88MPXIKbAZDZD";

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

function sendTextMessage(sender, text) {
  console.log('sender', sender);
  console.log('text', text);
  
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}
/*
app.configure(function(){
  app.use(express.bodyParser());
  app.use(app.router);
});
*/

// Node.js Example
app.get('/', function (req, res) {
  console.log('req', 'res');
  
  if (req.query['hub.verify_token'] === 'my_verify_token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');    
  }
});

app.post('/', function (req, res) {
  console.log('post', req.body);
  messaging_events = req.body.entry[0].messaging;
  
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    
    if (event.message && event.message.text) {
      text = event.message.text;
      // Handle a text message from this sender
      if (text === 'Generic') {
        sendGenericMessage(sender);
        continue;
      } else {
        sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
      }
    }
    
    if (event.postback) {
      text = JSON.stringify(event.postback);
      sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
      continue;
    }
  }
  res.status(200).send();
  //res.sendStatus(200);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
