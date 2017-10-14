var request=require('request');
var config = require('./config');
var splitText = require('./splitText.js');
var mess = require('./messTemplates.js');
var mongo =require('./mongoFunctions.js');

/*
webhookEvents
*/
//message text true false 
//is_echo: true false
//attachments: true false
//postcall true fasle
//delivery true false
function saveToUserBuff(id,mid,timestamp){
    var obj= {
        system:{
            messages:[true]
        
        }
        }
    mongo.findByParam({"personal.id":id},{_id:true},function(list){
        console.log(list);
    })
    mongo.modifyById(id,'person',obj,function(){
        console.log('ok');
        
        
    })
}
function messageDistribution(mess){
    switch(mess.type){
        case "read":
            console.log("Clearing messages...");
            //clear user buff
        break;
        case "delivery":
            //do nothing but do not let anything happen
        break;
        case "postback":
            if(mess["echo"] != true){
                //postback function
                console.log("That is clicked postback");
                console.log('Saving to user\'s message');
            }
        break;
        default:
            if(mess["echo"]==true){
                //console.log('Saving to user message');
                console.log('Saving to server\'s message');
                
            }
            else{
                console.log('check if attachments or text');
                console.log('Saving to users\'s message');
            }
        break;
            
            //do something else    
    }
    
    
}
function messageLogistic(params,event){
    var mess={}
    mess["timestamp"]=event.timestamp;
    mess["sender"]=event.sender.id;
    mess["page"]=event.recipient.id;
    mess["type"]="";
    console.log('begin');
    //switch(true){
        if(params.attachments == true){
            mess["attachments"]=event.message.attachments;
            //console.log('    got attachments')
        }
        if(params.text == true){
            mess["text"] = event.message.text;
            //console.log('    text type')
        }
        if(params.read == true){
            mess["type"]="read";
            mess["watermark"]=event.read.watermark;
            //console.log('    user read message')
        }
        if(params.payload == true){
            mess["type"]="postback";
            mess["payload"]=event.postback.payload;
            //console.log('    postback mess');
        }
        if(params.delivery == true){
            mess["type"]="delivery";
            mess["watermark"]=event.delivery.watermark;
            //console.log('   deliverd message');
        }
        if(params.echo == true){
            mess["echo"]=true;
            //console.log('   message from server')
        }
        //break;
    //}
    messageDistribution(mess);
    //console.log(mess);
    console.log('end;');
}


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
            pattern["attachments"]=event.message["attachments"];
        }
    }
    else if(type=="delivery"){
        pattern["mids"]=event[type].mids;
            pattern.watermark=event[type].watermark;
    }
   return pattern;
    
}
function attachments(event){
    var type = event.message.attachment.type;
    var link = event.message.attachment.payload.url;
    console.log('Got attachments: '+type)
    console.log('Location: '+link)
    
}
function delivered(event){
    //var mid = event.delivery.mids.mid;
    var id = event.sender.id;
    var time = event.watermark;
    console.log('All '+id+'\'s messages habe been senn before '+time);
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
function message(event) {
    //console.log('mes',event);
    console.log('mes',reduceElements("message",event));
    var mes = reduceElements("message",event);
    console.log(mes.attachments);
    //console.log('echo',reduceElements("message",event));
    //splitText.split(mes.text);
    //console.log(helpPageMessage(mes.sender));
    //callSendAPI(mess.unreadMessage(mes.sender));
    //saveToUserBuff(mes.sender);
    createButtons([['postback', 'example', 'Przykład']], function(buttons){
				var content={
					'text': "hello",
					'buttons': buttons
				}
				createMessage('generic', mes.sender, content, function(messageTS){
					callSendAPI(messageTS);
                    //callSendAPI(mess.helpPage(mes.sender));
				});
			});
    //callSendAPI(mess.helpPage(mes.sender));
    /*createMessage('text', mes.sender, "Nie potrafimy odpowiedzieć na pytanie, którego nie zadano.\nPrzykro nam :'(", function(messageTS){
					callSendAPI(messageTS);
    });*/
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
      console.error(response.body);
      console.error(error);
    }
  });
}
exports.delivered=delivered;
exports.echo=echo;
exports.postback=postback;
exports.message=message;
exports.attachments=attachments;
exports.messageLogistic=messageLogistic;