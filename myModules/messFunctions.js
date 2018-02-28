//messFunctions
var request = require('request');
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
		//console.log(singleBTN);
		//console.log(JSON.stringify(singleBTN));
		buttons.push(singleBTN);
	}
	setImmediate(function(){
		//console.log(buttons);
		callback(buttons);
	});
}
function createMessage(type, id, content, callback){
	var message = {
		recipient: {
		  id: id
		}
	};
	//console.log(content);
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
function callSendAPI(token) {
    var self=this;
    this.token=token;
    this.send=function(messageData){
        request({
            uri: 'https://graph.facebook.com/v2.7/me/messages',
            qs: { access_token: self.token },
            method: 'POST',
            json: messageData

          }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var recipientId = body.recipient_id;
              var messageId = body.message_id;

        //      console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
            } else {
              console.error("Unable to send message.");
              console.error("mes",response.body);
              console.error("res",error);
            }
        });
    }
}
exports.send=callSendAPI;
exports.preapreMessage=createMessage;
exports.prepareBtn=createButtons;