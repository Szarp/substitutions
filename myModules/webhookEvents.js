var request=require('request');
var config = require('./config');

/*
webhookEvents
*/
function reduceElements(type,event){
    //type delivery, message
    var pattern={
        sender:'<id>',
        page:'<id>',
        timestamp:'<time>',
        //mids:['<mids>'],
        watermark:'<watermark>',
        seq:"<seq>"
    }
        pattern.sender=event.sender.id;
        pattern.page=event.recipient.id;
        pattern.timestamp=event.timestamp;
        pattern.seq=event[type].seq;
    if(type=="message"){
        if(event.message["is_echo"]==true){
             pattern["text"]=event.message["text"];
            pattern["attachments"]=event.message["attachments"];
            pattern["mid"]=event[type].mid;
        }
        else{
            pattern.watermark=event[type].watermark;
            pattern["text"]=event.message["text"];
             pattern["mid"]=event[type].mid;
        }
    }
    else if(type=="delivery"){
        pattern["mids"]=event[type].mids;
            pattern.watermark=event[type].watermark;
    }
   return pattern;
    
}
function delivered(event){
    //console.log('delivered',event);
    //console.log('delivery',reduceElements("delivery",event));
}
function echo(event){
    //console.log('echo',event)
    var mes = reduceElements("message",event);
    //console.log('echo',reduceElements("message",event));
    //do what you want
    /*
    { sender: { id: '285771075161320' },
  recipient: { id: '1383716548353914' },
  timestamp: 1507658404809,
  message: 
   { is_echo: true,
     app_id: 190695904771523,
     mid: 'mid.$cAAFZG6pxbEtlOLbbyVfB3GR6JHPM',
     seq: 492132,
     attachments: [ [Object] ] } }
    */
    
}
function message(event) {
    //console.log('mes',event);
    console.log('mes',reduceElements("message",event));
    var mes = reduceElements("message",event);
    //console.log('echo',reduceElements("message",event));
    createMessage('text', mes.sender, "Nie potrafimy odpowiedzieć na pytanie, którego nie zadano.\nPrzykro nam :'(", function(messageTS){
					callSendAPI(messageTS);
    });
    //console.log('ok');
    /*
    mes { sender: { id: '1383716548353914' },
  recipient: { id: '285771075161320' },
  timestamp: 1507657863970,
  message: 
   { mid: 'mid.$cAAFZG6pxbEtlOK6bIlfB2lQnQCJF',
     seq: 492115,
     text: 'a' } }
     */
    /*
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	//console.log("Received message for user %d and page %d at %d with message:", 
	//senderID, recipientID, timeOfMessage);
	//console.log(JSON.stringify(message));

	var messageId = message.mid;

	var messageText = message.text;
	var messageAttachments = message.attachments;
	var help = 'NIE PRZYJMUJEMY ZAŁĄCZNIKÓW\nDostępne polecenia to:\n"0 klasa" - zastępstwa dla klasy na dzisiaj\n"1 klasa" - zastępstwa dla klasy na jutro\n"2 pytanie" - pomoc\n"4" - generuj token do łączenia kont\n"4 token" - połącz konto używając tokenu ze strony';
	facebook.messengerSavePerson(senderID, function(res){
		console.log('saving done');
		if (messageText) {
			sendSubstitutions(senderID, messageText);
		} else {
			createMessage('text', senderID, help, function(messageTS){
				callSendAPI(messageTS);
			});
		}
		if(res==='saved'){
			facebook.messengerUserInfo(senderID, function(userData){
				var txt = 'Nowa osoba: ' + userData['first_name'] + ' ' + userData['last_name'];
				createMessage('text', adm1, txt, function(messageTS){
					callSendAPI(messageTS);
				});
			});
		}
	});*/
}

function postback(event) {
    console.log('event',event);
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
      //console.error(response);
      console.error(error);
    }
  });
}

exports.delivered=delivered;
exports.echo=echo;
exports.postback=postback;
exports.message=message;