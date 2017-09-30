var config = require('./config');
var manageUsers = require('./manageUsers.js');
var request = require('request');
var facebook = require('./facebookComunication.js');
var callFunc = require('./postCallFunctions.js');
var secretToken = require('./secretTokenGenerator.js');
var mongo = require('./mongoFunctions.js');
//mongo.url("ZSO11");
var adm1 = config.adm1;
var adm2 = config.adm2;
var allClasses = ["1a","1b","1c","1d","1e","1f","2a","2b","2c","2d","3a","3b","3c","3d","2ga","2gb","2gc","2gd","3ga","3gb","3gc","3gd"];

//branch
function helpPageMessage(id){
    return{
        "recipient":{"id":id},
        "message": {
            "attachment": {"type": "template",
                "payload": {
                "template_type": "list",
                "elements": [
                {
                    "title": "Zastępstwa dla szkół",
                    "image_url": "http://www.zso11.zabrze.pl/wp-content/uploads/2017/03/galeria-1-1024x687.jpg",
                    "subtitle": "O aplikacji",
                    "buttons": [
                        {
                            "title": "Odwiedź stronę",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/helpPage.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/helpPage.htm"                        
                        }
                    ]
                },
                {
                    "title": "Funkcje szkolne",
                    "subtitle": "Dowiadywanie się o zastępstwach; komunikacja z adminem; powiadomienia autom.",
                    "buttons": [
                        {
                            "title": "Czytaj więcej",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/changes.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/changes.htm"                        
                        }
                    ]              
                },
                {
                    "title": "Olipiada",
                    "image_url":"https://anulowano.pl/demo/zwt.png",
                    "subtitle": "Projekt jest rozwijany na potrzeby olimiady projektow społecznych",
                    "buttons": [
                        {
                            "title": "Więcej Info",
                            "type": "web_url",
                            "url": "https://anulowano.pl/demo/olimpiada.htm",
                            "messenger_extensions": true,
                            "webview_height_ratio": "full",
                            "fallback_url": "https://anulowano.pl/demo/olimpiada.htm"                        
                        }
                    ]                   
                }
            ]
        }
    }
}   
    
}
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
    var day ='today';
	var body = {
		'mode': 'classList',
		'param': 'today'
	};
	var oMessage=message;
	message = message.toLowerCase();
	var opt = message[0];
	var help = 'Dostępne polecenia to:\n"0 klasa" - zastępstwa dla klasy na dzisiaj\n"1 klasa" - zastępstwa dla klasy na jutro\n"2 pytanie" - pomoc\n"4" - generuj token do łączenia kont\n"4 token" - połącz konto używając tokenu ze strony\nJeśli nie widzisz przycisku "Przykład" pod tą wiadomością zaktualizuj aplikację Messenger lub odwiedź bota przez przeglądarkę';
	var reqClass = message[2] + message[3];
	if(reqClass[1]=='g'){
		reqClass += message[4];
	}
	var reqTeacher = oMessage.substring(2);
	switch(opt){
		case '0':
			break;
		case '1':
			day='tomorrow'; //masz else, więc jak dam dobrze to przejdzie, chociaż ty piszesz źle
			break;
		case '2':
			day='';
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
		case '4':
			day='';
			var tkn = oMessage.substring(2);
			if(!tkn){
				secretToken.messRequest(senderID, function(token){
					var txt = 'Wygenerowany token wipsz na domek.emadar.eu po zalogowaniu i kliknięciu własnego zdjęcia profilowego w polu "Sprawdź token"\nTwój token to: ' + token;
					createMessage('text', senderID, txt, function(messageTS){
						callSendAPI(messageTS);
					});
				});
			} else {
				tkn = parseInt(tkn);
				console.log("Token received: " + tkn);
				secretToken.messCheck(senderID, tkn, function(res){
					if(res){
						createMessage('text', senderID, 'Konto zostało połączone. (y)', function(messageTS){
							callSendAPI(messageTS);
						});
					} else {
						createMessage('text', senderID, 'Wystąpił błąd. Spróbuj jeszcze raz.', function(messageTS){
							callSendAPI(messageTS);
						});
					}
				});
			}
			break;
		default:
			day='';
			createButtons([['postback', 'example', 'Przykład']], function(buttons){
				var content={
					'text': help,
					'buttons': buttons
				}
				createMessage('generic', senderID, content, function(messageTS){
					//callSendAPI(messageTS);
                    callSendAPI(helpPageMessage(senderID));
				});
			});
			break;
	};
	if(day != ''){
        if(opt == 0){
			var dayToMSG = 'Dzisiaj';
		}else{
			var dayToMSG = 'Jutro';
		}
        callFunc.changesForMessenger(reqClass,day,function(allChanges){
            if(allChanges.length != 0){
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
            }
            else{
				callFunc.changesTeacherForMessenger(reqTeacher.toLowerCase(),day,function(allChanges){
					if(allChanges.length != 0){
						createButtons([['web_url', 'https://domek.emadar.eu', 'Sprawdź na stronie'],['postback', message, 'Wyślij na czacie']], function(buttons){
							dayToMSG += ' są zastępstwa dla ' + reqTeacher;
							var content={
								text: dayToMSG,
								buttons: buttons
							}
							createMessage('generic', senderID, content, function(messageTS){
								callSendAPI(messageTS);
							});
						});
					}else{
						if(allClasses.indexOf(reqClass) > -1){
							dayToMSG += ' brak zastępstw dla klasy ' + reqClass;   
							createMessage('text', senderID, dayToMSG, function(messageTS){
								callSendAPI(messageTS);
							});
						}
						else{
							mongo.findById('all', 'teachers', function(err, obj){
								var tList = obj.teachers;
								var exist = false;
								var tExist = false;
								for(var z = 0; z < tList.length; z++){
									if(tList[z].toLowerCase() == reqTeacher.toLowerCase()){
										tExist = true;
									}
								}
								var klasy = allClasses[0]
								for(var i = 0; i < allClasses.length; i++){
									if(reqClass == allClasses[i]){
										exist=true;
									}
									if (i > 0){
										klasy += ', ' + allClasses[i];
									}
								}
								if(!exist && !tExist && reqClass.length > 0){
									dayToMSG = 'Żądana klasa nie istnieje. Dostępne klasy to:\n' + klasy + '\nDostępni nauczyciele - naciśnij guzik';	
									createButtons([['postback', 'teachers', 'Nauczyciele']], function(buttons){
										var content={
											text: dayToMSG,
											buttons: buttons
										}
										createMessage('generic', senderID, content, function(messageTS){
											callSendAPI(messageTS);
										});
									});
								} else if(!exist && !tExist){
									dayToMSG = 'Nie podałeś klasy :/\nDostępne klasy to:\n' + klasy + '\nDostępni nauczyciele - naciśnij guzik';	
									createButtons([['postback', 'teachers', 'Nauczyciele']], function(buttons){
										var content={
											text: dayToMSG,
											buttons: buttons
										}
										createMessage('generic', senderID, content, function(messageTS){
											callSendAPI(messageTS);
										});
									});
								} else {
									dayToMSG += ' brak zastępstw dla ' + reqTeacher;
									createMessage('text', senderID, dayToMSG, function(messageTS){
										callSendAPI(messageTS);
									});
								}
							});
						}
					}
				});
            }
        });
    }
}

function differencesBetweenSubs(date, callback){
	mongo.findById(date, 'substitutions', function(err, newSubObj){
		var newSub = newSubObj.substitution;
		var copyOfNew = JSON.parse(JSON.stringify(newSub));
		mongo.findById(date, 'substitutionsBuffer', function(err, oldSubObj){
			if(oldSubObj && oldSubObj.substitution){
				var oldSub = oldSubObj.substitution;
			} else {
				var oldSub = [];
			}
			if(newSub == '' || newSub == 'no substitutions'){
				newSub = [];
			}
			if(oldSub == '' || oldSub == 'no substitutions'){
				oldSub = [];
			}
			//var copyOfOld = oldSub;
			for(var i = newSub.length-1; i >= 0; i--){
				var newEl = JSON.stringify(newSub[i]);
				for(var e = 0; e < oldSub.length; e++){
					var oldEl = JSON.stringify(oldSub[e]);
					if(newEl == oldEl){
						newSub.splice(i, 1);
						oldSub.splice(e, 1);
					}
				}
			}
			/*if(newSub.length > 0){
				for(var i = copyOfOld.length-1; i >= 0; i--){
					var cOldEl = JSON.stringify(copyOfOld[i]);
					for(var e = 0; e < newSub.length; e++){
						var cNewEl = JSON.stringify(newSub[e]);
						if(cNewEl == cOldEl){
							newSub.splice(e, 1);
						}
					}
				}
			}*/
			setImmediate(function(){
				callback([newSub,oldSub]);
				var dataToSave = {
					substitution: copyOfNew,
					date: date
				}
				mongo.modifyById(date,'substitutionsBuffer',dataToSave,function(){
					console.log("Saved to buffer");
				});
			});
		});
	});
}
function substitutionNotification(day, date, callback){
	var days = ['niedzielę','poniedziałek','wtorek','środę','czwartek','piątek','sobotę'];
	var now = new Date();
	if(day == 'tomorrow'){
		day = days[(now.getDay() + 1)%7];
	} else if(day == 'today'){
		day = days[now.getDay()];
	} else if(day == 'TDAT'){
		day = days[(now.getDay() + 2)%7];
	}
	differencesBetweenSubs(date, function(newAndOld){
        var newSub=newAndOld[0];
        var oldSub=newAndOld[1];
		mongo.findByParam({"system.connected": true, "personal.settings.notification": "yes"}, {"personal.id": true, "personal.settings.setClass": true, "personal.settings.setTeacher": true}, 'person', function(usersList){
			if(usersList){
				for(var a = 0; a < usersList.length; a++){
					var oneUser = usersList[a];
					if(oneUser && oneUser.personal && oneUser.personal.id && oneUser.personal.settings.setClass){
						var uTeacher = "---";
						if(oneUser.personal.settings.setTeacher){
							uTeacher = oneUser.personal.settings.setTeacher;
						}
						var uClass = oneUser.personal.settings.setClass;
						var receipentId = oneUser.personal.id;
						if(newSub.length>0){
							for(var i = 0; i < newSub.length; i++){
								var oneSub = newSub[i];
								var classIDs = oneSub.classes;
								var teacherIDs = oneSub.teachers;
								var altTeacherIDs = "nothing";
								if(oneSub.changes && oneSub.changes.teachers){
									altTeacherIDs = oneSub.changes.teachers;
								}
								if(classIDs){
									for(var n = 0; n < classIDs.length; n++){
										var oneClass = classIDs[n];
										if(oneClass == uClass || teacherIDs == uTeacher || altTeacherIDs == uTeacher){
											messengerTypeChange(oneSub, receipentId, function(subMsg, uId){
												var msg = "Nowe zastępstwo na " + day + ":\n" + subMsg;
												createMessage('text', uId, msg, function(messageTS){
													callSendAPI(messageTS);
												});
											});
										}
									}
								}
							}
						}
						if(oldSub.length>0){
							for(var i = 0; i < oldSub.length; i++){
								var oneSub = oldSub[i];
								var classIDs = oneSub.classes;
								var teacherIDs = oneSub.teachers;
								var altTeacherIDs = "nothing";
								if(oneSub.changes && oneSub.changes.teachers){
									altTeacherIDs = oneSub.changes.teachers;
								}
								if(classIDs){
									for(var n = 0; n < classIDs.length; n++){
										var oneClass = classIDs[n];
										if(oneClass == uClass || teacherIDs == uTeacher || altTeacherIDs == uTeacher){
											messengerTypeChange(oneSub, receipentId, function(subMsg, uId){
												var msg = "Usunięte zastępstwo na " + day + ":\n" + subMsg;
												createMessage('text', uId, msg, function(messageTS){
													callSendAPI(messageTS);
												});
											});
										}
									}
								}
							}
						}
					}
				}
			}
		});
        setImmediate(function(){
            callback("Sent substitutions: " + newAndOld);
        });
    })
}
function messengerTypeChange(oneSub, uId, callback){
    var changes = oneSub['changes'];
    var msg = "";
	var classIDs = oneSub.classes;
	if(classIDs){
		var oneClass = classIDs[0];
		for(var n = 1; n < classIDs.length; n++){
			oneClass += ", " + classIDs[n];
		}
		if(oneSub.cancelled[0]){
			msg+='anulowanie';
		}else {
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
		msg+='\nKlasa: ' + oneClass;
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
	}
    setImmediate(function(){
		callback(msg, uId);
	});
}
 function notificationList(callback){
     var name='person';
        //[collection,{data}]
        //var collectionName = collection;
        //var data = paramsToModify;
     
        var url = 'mongodb://localhost:27017/test2';
        mongo.findByParam({"personal.settings.notification":'yes',"system.connected":true},{"personal.id":1,"personal.settings":1},name,function(a){
            console.log(a);
            var list=[];
            var arr={};
            for(var i=0;i<a.length;i++){
                arr['id']=a[i].personal['id'];
                arr['class']=a[i].personal.settings['setClass'];
                list[i]=arr;
                arr={};
            }
            
            setImmediate(function(){
					callback(list);
            }); 
            
        })
      
        
        //db.close();
 }

function sendList(senderID, message){
    var day = 'today';
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
		createMessage('text', senderID, 'Chcę wygenerować token do łączenia kont do wpisania na stronie:\n4', function(messageTS){
			callSendAPI(messageTS);
		});
		createMessage('text', senderID, 'Chcę połączyć konto korzystając z tokena "11111" wygenerowanego na stronie (zastąp 11111 twoim tokenem uzyskanym po kliknięciu "Generuj token" w zakładce "o mnie" [czyli po kliknięciu profilowego na domek.emadar.eu]):\n4 11111', function(messageTS){
			callSendAPI(messageTS);
		});
	}else if (message=='teachers'){
		mongo.findById('all', 'teachers', function(err, obj){
			if(!err){
				/*var a = 0;
				var msg = 'Dostępni nauczyciele to: ';
				for(var i = 0; i < obj.teachers.length; i++){
					msg += '\n' + obj.teachers[i];
					a++;
					if(a == 10){
						createMessage('text', senderID, msg, function(messageTS){
							callSendAPI(messageTS);
						});
						a = 0;
						msg = '';
					} else if (i == (obj.teachers.length-1)){
						createMessage('text', senderID, msg, function(messageTS){
							callSendAPI(messageTS);
						});
					}
				}*/
				sTL(obj.teachers, 'Dostępni nauczyciele to:', 0, senderID);
			} else {
				console.log("Error getting teachers list");
				createMessage('text', senderID, 'Wystąpił błąd, spróbuj ponownie', function(messageTS){
					callSendAPI(messageTS);
				});
			}
		});
	}else if (message=='help'){
		callSendAPI(helpPageMessage(senderID));
	}else if (message=='get_started_btn'){
		createButtons([['postback', 'help', 'Więcej']], function(buttons){
			var content={
				text: "Bot z zastępstwami wita Cię!\nDziękujemy za korzystanie z bota. Jeśli chcesz dowiedzieć się więcej, kliknij guzik poniżej.",
				buttons: buttons
			}
			createMessage('generic', senderID, content, function(messageTS){
				callSendAPI(messageTS);
			});
		});
	}else{
		if(message[0]=='1'){
			day='tomorrow';
		}
		var reqClass = message[2] + message[3];
		if(reqClass[1]=='g'){
			reqClass += message[4];
		}
        callFunc.changesForMessenger(reqClass,day,function(allChanges){
			if(allChanges.length != 0){
				for(var i=0;i<allChanges.length;i++){
					createMessage('text', senderID, allChanges[i], function(messageTS){
						callSendAPI(messageTS);
					});
				}
			} else {
				var reqTeacher = message.substring(2);
				callFunc.changesTeacherForMessenger(reqTeacher,day,function(allChanges){
					for(var i=0;i<allChanges.length;i++){
						createMessage('text', senderID, allChanges[i], function(messageTS){
							callSendAPI(messageTS);
						});
					}
				});
			}
        })
	}
}

function sTL(teachers, msg, i, senderID){
	console.log(msg, i, senderID);
	msg += '\n' + teachers[i];
	if(i != 0 && i%10 == 0 || i == (teachers.length-1)){
		createMessage('text', senderID, msg, function(messageTS){
			callSendAPIwC(messageTS, function(err){
				if(!err){
					msg = '';
					sTL(teachers, msg, (i+1), senderID);
				}
			});
		});
	} else if(i < teachers.length){
		sTL(teachers, msg, (i+1), senderID);
	}
}

function receivedPostback(event) {
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

function receivedMessage(event) {
    console.log('mes',event);
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
	});
}

function callSendAPIwC(messageData, callback){
	request({
		uri: 'https://graph.facebook.com/v2.7/me/messages',
		qs: { access_token: config.pageToken },
		method: 'POST',
		json: messageData
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
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

function sendToMessengerBtn(event){
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfAuth = event.timestamp;
	var passThroughParam = event.optin.ref;
	console.log("Received authentication for user %d and page %d with pass " + "through param '%s' at %d", senderID, recipientID, passThroughParam, timeOfAuth);
	if(!(passThroughParam)){
		console.error("no passThroughParam received");
	} else {
	var fbUID = passThroughParam;
	secretToken.connectAccounts(fbUID, senderID, function () {
		console.log("Accounts connected!");
		mongo.modifyById(fbUID, 'person', {"personal.settings.notification": "yes"}, function(){
			console.log("Notifications for", fbUID, "are on.");
			createMessage('text', senderID, "Your account is now connected. Go to " + config.url + " and select class in settings in order to receive notifications.", function(messageTS){
				callSendAPI(messageTS);
			})
		})
	});
	}
}

exports.receivedPostback=receivedPostback;
exports.receivedMessage=receivedMessage;
exports.notification=substitutionNotification;
exports.createMessage=createMessage;
exports.callSendAPI=callSendAPI;
exports.sTMB=sendToMessengerBtn;