var config = require('./config');
var manageUsers = require('./manageUsers.js');
var request = require('request');
var facebook = require('./facebookComunication.js');
var callFunc = require('./postCallFunctions.js');
var secretToken = require('./secretTokenGenerator.js');
const mongo3 = require("./mongoFunctions3");
var mess = require('./messTemplates.js');
//mongo.url("ZSO11");
var adm1 = config.adm1;
var adm2 = config.adm2;
var allClasses = ["1na","1nb","1nc","1nd","1ne","1nf","1a","1b","1c","1d","1e","1f","2a","2b","2c","2d","2e", "2f","3a","3b","3c","3d","3e", "3f"];

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
			if(message.length>5){ // '2 1gb' and other similiar should be ignored
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
				createMessage('text', senderID, "Nie potrafimy odpowiedzieć na pytanie, którego nie zadano.\nPrzykro nam :'(\nJeśli chciałeś spytać o zastępstwa, użyj 0 lub 1. Instrukcja dostępna jest w \"Funkcje szkolne\" w pomocy.", function(messageTS){
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
					var txt = 'Wygenerowany token wipsz na ' + config.url + ' po zalogowaniu i kliknięciu własnego zdjęcia profilowego w polu "Sprawdź token"\nTwój token to: ' + token;
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
			callSendAPI(mess.helpPage(senderID));
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
				createButtons([['postback', message, 'Wyślij na czacie']], function(buttons){
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
						createButtons([['web_url', config.url, 'Sprawdź na stronie'],['postback', message, 'Wyślij na czacie']], function(buttons){
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
							mongo3.findById("all", "teachers", function(err, obj){
								if(err){
									console.error(err);
									createMessage("text", senderID, "Wystąpił błąd. Spróbuj ponownie później");
									return;
								}
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
	mongo3.findById(date, "substitutions", function(err, newSubObj){
		if (!err && newSubObj && newSubObj.substitution) {
			var newSub = newSubObj.substitution;
			var copyOfNew = JSON.parse(JSON.stringify(newSub));
			mongo3.findById(date, "substitutionsBuffer", function(err, oldSubObj){
				if(err){
					console.error(err);
				}
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
				setImmediate(function(){
					callback([newSub,oldSub]);
					var dataToSave = {
						substitution: copyOfNew,
						date: date
					};
					mongo3.modifyById(date, "substitutionsBuffer", dataToSave, function (err) {
						if (err) console.error("Saving to buffer failed:", err);
					});
				});
			});
		} else if (err){
			console.error(err);
		}
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
	} else if (day === null){
		day = days[new Date(date).getDay()];
	}



	differencesBetweenSubs(date, function(newAndOld){
		var newSub=newAndOld[0];
		var oldSub=newAndOld[1];
		mongo3.findByParam({ "system.connected": true, "personal.settings.notification": "yes" }, { "personal.id": 1, "personal.settings.setClass": 1, "personal.settings.setTeacher": 1 }, "person", function (err, usersList) {
			if (!err && usersList) {
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
										/** Array of changes in this substitution (eg. teacher, subject, classroom) */
										let changesKeysArr = Object.keys(oneSub.changes ? oneSub.changes : {});
										if((oneClass == uClass || teacherIDs == uTeacher || altTeacherIDs == uTeacher) && (oneSub.cancelled[0] || oneSub.substitution_types || changesKeysArr.length > 1 || (changesKeysArr.length == 1 && !changesKeysArr.includes("classes")))){
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
										/** Array of changes in this substitution (eg. teacher, subject, classroom) */
										let changesKeysArr = Object.keys(oneSub.changes ? oneSub.changes : {});
										if((oneClass == uClass || teacherIDs == uTeacher || altTeacherIDs == uTeacher) && (oneSub.cancelled[0] || oneSub.substitution_types || changesKeysArr.length > 1 || (changesKeysArr.length == 1 && !changesKeysArr.includes("classes")))){
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
			} else if (err) {
				console.error(err);
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
		}else{
			/** Array of changes in this substitution (eg. teacher, subject, classroom) */
			let changesKeysArr = Object.keys(oneSub.changes ? oneSub.changes : {});
			/** @type {string} Type of this substitution */
			var subType;
			if(oneSub.substitution_types){
				subType = oneSub.substitution_types;
			} else if(changesKeysArr.length == 1 && changesKeysArr.includes("classrooms")){
				subType = "przesunięcie do sali";
			} else {
				subType = "zastępstwo";
			}
			msg+=`Typ: ${subType}`;
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
		createMessage('text', senderID, 'Chcę połączyć konto korzystając z tokena "11111" wygenerowanego na stronie (zastąp 11111 twoim tokenem uzyskanym po kliknięciu "Generuj token" w zakładce "o mnie" [czyli po kliknięciu profilowego na ' + config.url + ']):\n4 11111', function(messageTS){
			callSendAPI(messageTS);
		});
	}else if (message=='teachers'){
		mongo3.findById("all", "teachers", function(err, obj){
			if(!err){
				sTL(obj.teachers, 'Dostępni nauczyciele to:', 0, senderID);
			} else {
				console.log("Error getting teachers list");
				createMessage("text", senderID, "Wystąpił błąd, spróbuj ponownie", function(messageTS){
					callSendAPI(messageTS);
				});
			}
		});
	}else if (message=='help'){
		callSendAPI(mess.helpPage(senderID));
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

function callSendAPIwC(messageData, callback){
	request({
		uri: 'https://graph.facebook.com/v2.9/me/messages',
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
		uri: 'https://graph.facebook.com/v2.9/me/messages',
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

function sendToMessengerBtn(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfAuth = event.timestamp;
	var passThroughParam = event.optin.ref;
	console.log("Received authentication for user %d and page %d with pass " + "through param '%s' at %d", senderID, recipientID, passThroughParam, timeOfAuth);
	if (!(passThroughParam)) {
		console.error("no passThroughParam received");
	} else {
		var fbUID = passThroughParam;
		secretToken.connectAccounts(fbUID, senderID, function () {
			console.log("Accounts connected!");
			mongo3.modifyById(fbUID, "person", { "personal.settings.notification": "yes" }, function (err) {
				if (err) {
					console.error("Enabling messenger notifications failed:", err);
				} else {
					console.log("Notifications for", fbUID, "are on.");
				}
				createButtons([["postback", "help", "Więcej"]], function (buttons) {
					var content = {
						text: `Konta zostały połączone. Odwiedź ${config.url} i ${err ? "ustaw `Notification on Messenger` na `yes` oraz " : ""}wybierz klasę w ustawieniach, aby otrzymywać powiadomienia. Jeśli chcesz dowiedzieć się więcej, kliknij guzik poniżej.`,
						buttons: buttons
					};
					createMessage("generic", senderID, content, function (messageTS) {
						callSendAPI(messageTS);
					});
				});
			});
		});
	}
}


exports.notification=substitutionNotification;
exports.createMessage=createMessage;
exports.callSendAPI=callSendAPI;
exports.sTMB=sendToMessengerBtn;
