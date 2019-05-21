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
            uri: 'https://graph.facebook.com/v2.9/me/messages',
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
              if (response && response.statusCode) console.error("Status code:", response.statusCode);
              if (response && response.body) console.error("Response body:", response.body);
              console.error(error);
            }
        });
	};
	/**
	 * Send `messageData` and execute callback
	 * @param {Object} messageData - object created by `createMessage()`
	 * @param {Object} messageData.recipient - receipient object
	 * @param {number|string} messageData.recipient.id id of recipient
	 * @param {string} messageData.text text of message (if it's a text message)
	 * @param {Function} callback callback to execute, one parameter passed - error (`true/null`)
	 */
	this.sendWC = function (messageData, callback){
		request({
			uri: 'https://graph.facebook.com/v2.9/me/messages',
			qs: { access_token: self.token },
			method: 'POST',
			json: messageData
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				setImmediate(function(){
					callback(null);
				});
			} else {
				console.error("Unable to send message.");
				console.error(response);
				console.error(error);
				setImmediate(function(){
					callback(true);
				});
			}
		});
	};
}
exports.send=callSendAPI;
exports.preapreMessage=createMessage;
exports.prepareBtn=createButtons;
