var config = require('./config');
var manageUsers = require('./manageUsers.js');
var request = require('request');
//var mongo = require('./mongoFunctions.js');
var adm1 = config.adm1;
var adm2 = config.adm2;

function sendSubstitutions(senderID, message){
	var admMessage1 = {
		recipient: {
		  id: adm1
		},
		message: {
		  text: 'nowa wiadomość:\n' + message
		}
	};
	var admMessage2 = {
		recipient: {
		  id: adm2
		},
		message: {
		  text: 'nowa wiadomość:\n' + message
		}
	};
	var body = {
		'mode': 'classList',
		'param': 'today'
	};
	message = message.toLowerCase();
	var opt = message[0];
	var help = 'Dostępne polecenia to:\n"0 <klasa>" - zastępstwa dla klasy na dzisiaj\n"1 <klasa>" - zastępstwa dla klasy na jutro\n"2 <pytanie>" - pomoc';
	var messageData = {
		recipient: {
		  id: senderID
		},
		message: {
		  text: help
		}
	};
	var reqClass = message[2] + message[3];
	if(reqClass[1]=='g'){
	reqClass += message[4];};
	switch(opt){
		case '0':
			break;
		case '1':
			body['param']='tomorrow'; //masz else, więc jak dam dobrze to przejdzie, chociaż ty piszesz źle
			break;
		case '2':
			body['mode']='NO';
			var messageData = {
				recipient: {
				  id: senderID
				},
				message: {
				  text: 'Skontaktujemy się aby odpowiedzieć na pytanie.'
				}
			};
			callSendAPI(messageData);
			callSendAPI(admMessage1);
			callSendAPI(admMessage2);
			break;
		default:
			body['mode']='NO';
			callSendAPI(messageData);
			break;
	};
	if(body['mode'] != 'NO'){
		manageUsers.postCall('0000', body, function(classes){
			var is = 0;
			for(var i = 0; i < classes.length; i++){
				if(classes[i] == reqClass){
					is++;
				}
			}
			if(is > 0){
				var messageData = {
					recipient: {
					  id: senderID
					},
					message: {
					  text: 'Zastępstwa'
					}
				};
			} else {
				var messageData = {
					recipient: {
					  id: senderID
					},
					message: {
					  text: 'brak zastępstw'
					}
				};
			}
			callSendAPI(messageData);
		});
	}
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  //sendTextMessage(senderID, "Postback called");
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  /*if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }*/
  sendSubstitutions(senderID, messageText);
  //sendTextMessage(senderID, messageText);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.7/me/messages',
    qs: { access_token: config.pageToken },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

/*function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}*/

/*function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}*/

exports.receivedPostback=receivedPostback;
exports.receivedMessage=receivedMessage;
