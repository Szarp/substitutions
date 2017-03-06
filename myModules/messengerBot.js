var config = require('./config');
var manageUsers = require('./manageUsers.js');
var request = require('request');
var facebook = require('./facebookComunication.js');
//var mongo = require('./mongoFunctions.js');
var adm1 = config.adm1;
var adm2 = config.adm2;
var allClasses = ["1a","1b","1c","1d","2a","2b","2c","2d","3a","3b","3c","3d","1ga","1gb","1gc","1gd","2ga","2gb","2gc","2gd","3ga","3gb","3gc","3gd"];

function createMessage(type, id, content, callback){
	var message = {
		recipient: {
		  id: id
		}
	};
	console.log(content);
	if(type == 'text'){
		message['message']={text: content};
	}else{
		message['message']={
			attachment:{
				type: 'template',
				payload:{
					template_type: 'button',
					text: content['text'],
					buttons: content['buttons']
				}
			}
		}
	}
	setImmediate(function(){
		callback(message);
	});
}

function createButtons(tab, callback){
	var buttons=[];
	for(var i = 0; i < tab.length; i++){
		var btn = tab[i];
		var singleBTN={};
		singleBTN['type']=btn[0];
		singleBTN['title']=btn[2];
		if(btn[0]=='web_url'){
			singleBTN['url']=btn[1];
		} else if(btn[0]=='postback'){
			singleBTN['payload']=btn[1];
		}
		console.log(singleBTN);
		console.log(JSON.stringify(singleBTN));
		buttons.push(singleBTN);
	}
	setImmediate(function(){
		console.log(buttons);
		callback(buttons);
	});
}

function sendSubstitutions(senderID, message){
	var body = {
		'mode': 'classList',
		'param': 'today'
	};
	var oMessage=message;
	message = message.toLowerCase();
	var opt = message[0];
	var help = 'Dostępne polecenia to:\n"0 klasa" - zastępstwa dla klasy na dzisiaj\n"1 klasa" - zastępstwa dla klasy na jutro\n"2 pytanie" - pomoc';
	var reqClass = message[2] + message[3];
	if(reqClass[1]=='g'){
		reqClass += message[4];
	}
	switch(opt){
		case '0':
			break;
		case '1':
			body['param']='tomorrow'; //masz else, więc jak dam dobrze to przejdzie, chociaż ty piszesz źle
			break;
		case '2':
			body['mode']='NO';
			if(message.length>2){
				createMessage('text', senderID, 'Skontaktujemy się aby odpowiedzieć na pytanie.', function(messageTS){
					callSendAPI(messageTS);
				});
				createButtons([['web_url', 'https://www.facebook.com/Zastępstwa-dla-szkół-573446562859405/messages', 'Odpowiedz'],['web_url', 'https://m.facebook.com/messages/?pageID=573446562859405', 'Odpowiedz z tel']], function(buttons){
					facebook.messengerUserInfo(senderID, function(userData){
						if(oMessage[1]==' ' || oMessage[1]=='.' || oMessage[1]==','){
							var uMessage=oMessage.substring(2);
						}else{
							var uMessage=oMessage.substring(1);
						}
						var content={
							text: 'nowa wiadomość od ' + userData['first_name'] + ' ' + userData['last_name'] + ':\n' + uMessage,
							buttons: buttons
						}
						createMessage('generic', adm1, content, function(messageTS){
							callSendAPI(messageTS);
						});
						createMessage('generic', adm2, content, function(messageTS){
							callSendAPI(messageTS);
						});
					});
				});
			} else {
				createMessage('text', senderID, "Nie potrafimy odpowiedzieć na pytanie, którego nie zadano.\nPrzykro nam :'(", function(messageTS){
					callSendAPI(messageTS);
				});
			}
			break;
		/*case '3':
			body['mode']='NO';
			createMessage('text', senderID, 'Jakiś tekst - test', function(message){
				callSendAPI(message);
			});
			createButtons([['web_url', 'https://google.com', 'TEST LINK'],['postback', 'payload', 'POSTBACK - TEST']], function(buttons){
				var content={
					'text': 'TEST GENERIC',
					'buttons': buttons
				}
				createMessage('generic', senderID, content, function(message){
					callSendAPI(message);
				});
			});
			break;*/
		default:
			body['mode']='NO';
			createButtons([['postback', 'example', 'Przykład']], function(buttons){
				var content={
					'text': help,
					'buttons': buttons
				}
				createMessage('generic', senderID, content, function(messageTS){
					callSendAPI(messageTS);
				});
			});
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
			if(opt == 0){
				var dayToMSG = 'Dzisiaj';
			} else {
				var dayToMSG = 'Jutro';
			}
			if(is > 0){
				createButtons([['web_url', 'https://domek.emadar.eu', 'Sprawdź na stronie'],['postback', message, 'Wyślij na czacie']], function(buttons){
					dayToMSG += ' są zastępstwa dla klasy ' + reqClass;
					var content={
						text: dayToMSG,
						buttons: buttons
					}
					createMessage('generic', senderID, content, function(messageTS){
						callSendAPI(messageTS);
					});
				});
			} else {
				if(reqClass.length != undefined){
					dayToMSG += ' brak zastępstw dla klasy ' + reqClass;
					var exist = false;
					for(var i = 0; i < allClasses.length; i++){
						if(reqClass == allClasses[i]){
							exist=true;
						}
					}
					if(!exist){
						var klasy = allClasses[0];
						for(var i = 1; i < allClasses.length; i++){
								klasy += ', ' + allClasses[i];
						}
						dayToMSG = 'Żądana klasa nie istnieje. Dostępne klasy to:\n' + klasy;
					}
				} else {
					dayToMSG = 'Nie podałeś klasy :/'
				}
				createMessage('text', senderID, dayToMSG, function(messageTS){
					callSendAPI(messageTS);
				});
			}
		});
	}
}

function sendList(senderID, message){
	var body = {
		'mode': 'getChanges',
		'param': 'today'
	};
	if(message=='example'){
		createMessage('text', senderID, 'Chcę sprawdzić zastępstwa na dzisaj dla klasy 1b:\n0 1b', function(messageTS){
			callSendAPI(messageTS);
		});
		createMessage('text', senderID, 'Chcę sprawdzić zastępstwa na jutro dla klasy 2gc:\n1 2gc', function(messageTS){
			callSendAPI(messageTS);
		});
		createMessage('text', senderID, 'Mam jakąś propozycję/pytanie:\n2 Możecie poprawić ??? na stronie i w bocie zmienić ???', function(messageTS){
			callSendAPI(messageTS);
		});
	}else{
		if(message[0]=='1'){
			body['param']='tomorrow';
		}
		var reqClass = message[2] + message[3];
		if(reqClass[1]=='g'){
			reqClass += message[4];
		}
		manageUsers.postCall('0000', body, function(obj){
			var subs = obj['substitution'];
			var msg = "";
			for(var i = 0; i < subs.length; i++){
				var oneSub = subs[i];
				var classIDs = oneSub.classes;
				for(var n = 0; n < classIDs.length; n++){
					if(classIDs[n] == reqClass){
						var changes = oneSub['changes'];
						if(oneSub.cancelled[0]){
							msg+='anulowanie';
						} else {
							msg+='Typ: ' + oneSub.substitution_types;
						}
						msg+='\nLekcja: ' + oneSub.periods;
						msg+='\nNauczyciel: ' + oneSub.teachers;
						if(changes){
							if(changes.teachers){
								msg+=' => ' + changes.teachers;
							}
						}
						msg+='\nPrzedmiot: ' + oneSub.subjects;
						if(changes){
							if(changes.subjects){
								msg+= ' => ' + changes.subjects;
							}
						}
						msg+='\nSala: ' + oneSub.classrooms;
						if(changes){
							if(changes.classrooms){
								msg+=' => ' + changes.classrooms;
							}
						}
						if(oneSub.groupnames){
							if(oneSub.groupnames != ""){
								msg+='\nGrupa: ' + oneSub.groupnames;
							}
						}
						if(oneSub.note){
							if(oneSub.note != ""){
								msg+='\nKomentarz: '  + oneSub.note;
							}
						}
						createMessage('text', senderID, msg, function(messageTS){
							callSendAPI(messageTS);
						});
						msg='';
					}
				}
			}
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

	sendList(senderID, payload);
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
	var help = 'NIE PRZYJMUJEMY ZAŁĄCZNIKÓW\nDostępne polecenia to:\n"0 klasa" - zastępstwa dla klasy na dzisiaj\n"1 klasa" - zastępstwa dla klasy na jutro\n"2 pytanie" - pomoc';
	/*facebook.messengerUserInfo(senderID, function(userData){
		console.log(userData);
		console.log('Wiadomość od ' + userData['first_name'] + ' ' + userData['last_name']);
	});*/
	

	if (messageText) {
		sendSubstitutions(senderID, messageText);
	} else {
		createMessage('text', senderID, help, function(messageTS){
			callSendAPI(messageTS);
		});
	}
	facebook.messengerSavePerson(senderID, function(res){
		console.log('saving done');
	});
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
