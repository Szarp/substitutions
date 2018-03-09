//zso11_mesLogistic.js
//global
var request=require('request');
var config = require('./configs/zso11');
//var splitText = require('./splitText.js');
var mess = require('./messTemplates.js');
var mongo =require('./mongoFunctions.js');
var mon = require('./mongoConnection.js');
var callFunc = require('./postCallFunctions.js');
//messenger
var template = require('./messTemplates.js');
var messFunc = require('./messFunctions.js');
var secretToken = require('./secretTokenGenerator.js');
var setTime = require('./setTime.js');
var time = new setTime();
//var myFunc = require(__dirname+'/myModules/zsoServerComunication.js');
//var fs = require ('fs');
//var mon = require('./mongoConnection.js');


//zckioz config
//const Console = console.Console;

//console.time("a");
/*
webhookEvents
*/
//message text true false 
//is_echo: true false
//attachments: true false
//postcall true fasle
//delivery true false
var serverDB = new mon.server(config.db);
var userDB = new mon.user(config.db);
var subDB = new mon.substitutions(config.db);
var messenger = new messFunc.send(config.pageToken);
//serverDB.init();
//subDB.collectionList(function(e,r){console.log(r)});
//subDB.remove("2017-12-14",function(e,r){console.log(r.result)});
//insertRandomMessages(10000);

//userDB.init();
//userDB.remove("userMessages",function(e,r){console.log(e,r.result)});
//subDB.find({},{},function(e,r){console.log(e,r)});
function isThisMe(pageId){
    return (pageId==config.pageId);
}
function messageDistribution(mess){
    console.log("mess",mess);
    switch(mess.type){
        case "read":
            //console.log("Clearing messages...");
            //clear user buff
        break;
        case "delivery":
            //do nothing but do not let anything happen
        break;
        case "postback":
            if(mess["echo"] != true){
                //postback function
                console.log("postback");
                
                serverDB.save(mess,function(e,r){
                     if(!e){
                        console.log('Saving  users\'s message',r["result"]);
                         if(r["result"]["nModified"]!=0){
                            analizePostback(mess); 
                         }
                    }
                    else{
						console.log("Error in saving users\'s message",e);
						analizePostback(mess); //We still need to analyse the postback
                    }
                });
            }
        break;
        case "optin":
            sendToMessengerBtn(mess);
            break;
        default:
            if(mess["echo"]==true){
                //console.log('Saving to user message');
                serverDB.save(mess,function(e,r){
                    if(!e){
                        console.log('Saving  server\'s message',r["result"]);    
                    }
                    else{
                        console.log("Error in saving server\'s message",e);
                    }
                });
            }
            else{
                userDB.save(mess,function(e,r){
                    if(!e){
                        if(!mess["attachments"]){
                            if(r["result"]["nModified"]!=0){
                                analizeText(mess);
                            }
                    }
                    else{
                        //analizeAttachments(mess);
                        //console.log("atta",mess);
                    }
                            console.log('Saving users\'s message',r["result"]);    
                        }
                        else{
                            console.log("Error in saving user\'s message",e);
                        }
                })
                //console.log('Saving to users\'s message');
            }
        break;
    }
}
function token(text,mess){
    var senderID=mess.sender;
    var tkn = text[1];
		//var tkn = oMessage.substring(2);
		if(!tkn){
            secretToken.messRequest(senderID, function(token){
				var txt = 'Wygenerowany token wipsz na ' + config.url + ' po zalogowaniu i kliknięciu właego zdjęcia profilowego w polu "Sprawdź token"\nTwój token to: ' + token;
					messFunc.preapreMessage('text', senderID, txt, function(messageTS){
						messenger.send(messageTS);
					});
				});
			} else {
				tkn = parseInt(tkn);
				console.log("Token received: " + tkn);
				secretToken.messCheck(senderID, tkn, function(res){
					if(res){
						messFunc.preapreMessage('text', senderID, 'Konto zostało połączone. (y)', function(messageTS){
							messenger.send(messageTS);
						});
					} else {
						messFunc.preapreMessage('text', senderID, 'Wystąpił błąd. Spróbuj jeszcze raz.', function(messageTS){
							messenger.send(messageTS);
						});
					}
				});
			}    
}
/**
 * Object passed from moduleSwitch and messageDistribution
 * @typedef {Object} Mess
 * @property {number} sender id of user who sent the message
 * @property {number} page page (receiver) id
 * @property {number} timestamp message timestamp
 * @property {string} type type of received event
 * @property {string} [passThroughParam] param passed by Send to Messenger button
 * @property {string} [text] text of message
 * @property {string} [payload] payload of received postback
*/
/**
 * Connects user's Messenger id with their Facebook id and enables auto notifications
 * @param {Mess} mess object passed from moduleSwitch and messageDistribution
 * 
*/
function sendToMessengerBtn(mess){
	var senderID = mess.sender;
	var recipientID = mess.page;
    var timeOfAuth = mess.timestamp;
	var passThroughParam = mess.passThroughParam;
	console.log("Received authentication for user %d and page %d with pass " + "through param '%s' at %d", senderID, recipientID, passThroughParam, timeOfAuth);
	if(!(passThroughParam)){
		console.error("no passThroughParam received");
	} else {
        var fbUID = passThroughParam;
        secretToken.connectAccounts(fbUID, senderID, function () {
            console.log("Accounts connected!");
            mongo.modifyById(fbUID, 'person', {"personal.settings.notification": "yes"}, function(){
                console.log("Notifications for", fbUID, "are on.");
                messFunc.prepareBtn([['postback', 'help', 'Więcej']], function(buttons){
                    var content = {
                        text: "Konta zostały połączone. Odwiedź " + config.url + " i wybierz klasę w ustawieniach, aby otrzymywać powiadomienia. Jeśli chcesz dowiedzieć się więcej, kliknij guzik poniżej.",
                        buttons: buttons
                    };
                    messFunc.preapreMessage('generic', senderID, content, function(messageTS){
                        messenger.send(messageTS);
                    });
                });
            });
        });
	}
}
function analizeText(mess){
    mess.text=mess.text.toLowerCase();
    var text = mess.text.split(' ');
    if(text[0]=="4"){
            token(text,mess);        
        }
    else if(text.length == 2){
        //console.log("Maybe thats ask for changes");
        ifChanges(text,function(changes,weekDay){
            //console.log('chnages',changes);
            if(changes){
                if(changes.length>0){
                messFunc.prepareBtn([['postback','{"type":"changes","day":"'+text[0]+'","class":"'+text[1]+'"}', 'Wyślij na czacie']], function(buttons){
                        //com += ' Są zastępstwa dla klasy ' + text[1];
                        var content={
                            text:'Zastępstwa na '+weekDay+' dla klasy ' + text[1],
                            buttons: buttons
                        };
                        messFunc.preapreMessage('generic', mess.sender, content, function(messageTS){
                            messenger.send(messageTS);
                        });
                    });
                }
                else{
                    messFunc.preapreMessage('text', mess.sender,'Brak zastępstw na '+weekDay+' dla klasy '+ text[1], function(messageTS){
                        messenger.send(messageTS);
                    });
                }
            }
        });
    }
    else{
        if(text[0]=="pomoc"||text[0]=="help"){
            console.log("user id",mess.sender);
            messenger.send(template.helpPage(mess.sender));
        }
        else{
            console.log("Pop info about bad message to Admins");
        }
    }
}
function analizePostback(mess) {
    var payload = mess.payload;
    try {
        payload = JSON.parse(payload);
    } catch (e) {
        if (e instanceof SyntaxError) {
            payload = { type: payload };
        } else {
            console.error(e);
        }
    }
    switch(payload.type){
        case "example":
		messFunc.preapreMessage('text', mess.sender, 'Chcę sprawdzić zastępstwa na dzisaj dla klasy 1b:\n0 1b', function(messageTS){
			messenger.send(messageTS);
        });
		break;
		case "help":
			messenger.send(template.helpPage(mess.sender));
			break;
        case "changes":
            var day;
            if(payload.day=="0")
                day="today";
            if(payload.day=="1")
                day="tommorow";
            changesForMessenger(payload.class,day,function(allChanges){
                console.log("hey",allChanges);
			if(allChanges.length != 0){
				for(var i=0;i<allChanges.length;i++){
					messFunc.preapreMessage('text', mess.sender, allChanges[i], function(messageTS){
						messenger.send(messageTS);
					});
				}
			}
        });
        break;
        case "get_started_btn":
            messFunc.prepareBtn([['postback', 'help', 'Więcej']], function(buttons){
                var content={
                    text: "Bot z zastępstwami wita Cię!\nDziękujemy za korzystanie z bota. Jeśli chcesz dowiedzieć się więcej, kliknij guzik poniżej.",
                    buttons: buttons
                }
                messFunc.preapreMessage('generic', mess.sender, content, function(messageTS){
                    messenger.send(messageTS);
                });
            });
        break;
        case "teachers":
            mongo.findById('all', 'teachers', function(err, obj){
                if(!err){
                    sTL(obj.teachers, 'Dostępni nauczyciele to:', 0, mess.sender);
                } else {
                    console.log("Error getting teachers list");
                    messFunc.preapreMessage('text', mess.sender, 'Wystąpił błąd, spróbuj ponownie', function(messageTS){
                        messenger.send(messageTS);
                    });
                }
            });
            break;
        default:
            console.warn("Unknown payload received:", payload);
        break;
    }
    /*
    console.log('event',event);
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfPostback = event.timestamp;

	// The 'payload' param is a developer-defined field which is set in a postback 
	// button for Structured Messages. 
	var payload = event.postback.payload;

	console.log("Received postback for user %d and page %d with payload '%s' " + 
	"at %d", senderID, recipientID, payload, timeOfPostback);

	sendList(senderID, payload);*/
}
/**
 * Send list of all teachers
 * @param {string[]} teachers list of all teachers that will be sent
 * @param {string} msg message (beginning)
 * @param {number} i number of teacher to add *(should be 0 if sTL is not executed by itself)*
 * @param {number} senderID id of user, who asked for list
*/
function sTL(teachers, msg, i, senderID){
	msg += '\n' + teachers[i];
	if(i != 0 && i%10 == 0 || i == (teachers.length-1)){
		messFunc.preapreMessage('text', senderID, msg, function(messageTS){
			messenger.sendWC(messageTS, function(err){
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
function commandValidation(text){
    var allClasses = config.classList;
    var day="";
    if(allClasses.indexOf(text[1]) > -1){
        if(text[0] == "0" || text[0] == "1")
        return true;
    }
    else 
        return false;
    
    
}
function ifChanges(text,callback){
    if(commandValidation(text)){
        var day;
        switch(text[0]){
            case "0":
                day="today";
            break;
            case "1":
                day="tommorow"
            break;
        }
        changesForMessenger(text[1],day,function(allChanges,weekDay){
            setImmediate(function(){
                callback(allChanges,weekDay);
            });            
        });    
    }
    else{
        setImmediate(function(){
                callback();
            });
    }
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
    console.log('All '+id+'\'s messages have been senn before '+time);
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
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
function getChanges(body,callback){ //resposne app's format changes
    if(body['param']=='today'){
        time.todayIs();
    } else if(body['param']=='TDAT'){
		time.theDayAfterTomorrowIs();
	} else {
        time.tommorowIs();
    }
    var day = time.displayWeekDay();
    //console.log('requested date: ',time.displayTime());
    subDB.find({_id:time.displayTime()},{},function(err,elems){
        var obj = elems[0];
        if(err){console.log('err in sending substitutions')}
        var objToSend={};
        if(obj){
            objToSend['substitution']=obj['substitution'];
            if(obj['date'] == undefined){obj['date']='31-12-2016'}
            objToSend['date']=obj['date'];
        } 
        else {
            objToSend['substitution']='';
			objToSend['date']='ERROR';
        }
        setImmediate(function(){
            callback(objToSend,day);
        });
    });
}
function changesForMessenger(reqClass,day,callback){ //response Messenger's format changes
    //reqClass String [class]
    //day String [today;tommorow]
    getChanges({param:day},function(obj,weekDay){
        var tableOfMesseges=[];
		var msg = "";
        //console.log(obj);
        if(obj['substitution'] != 'no substitutions'){
            var subs = obj['substitution'];
            for(var i = 0; i < subs.length; i++){
                var oneSub = subs[i];
                var classIDs = oneSub.classes;
                if(classIDs){
                    for(var n = 0; n < classIDs.length; n++){
                        if(classIDs[n] == reqClass && oneSub.cancelled[0] || classIDs[n] == reqClass && oneSub.substitution_types){
                            var changes = oneSub['changes'];
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
                            tableOfMesseges[tableOfMesseges.length]=msg;
                            msg='';
                        }
                    }
                }
            }
        }
        setImmediate(function() {
            callback(tableOfMesseges,weekDay);
        });
    });
}


exports.subs = getChanges;
exports.messengerChanges=changesForMessenger;
exports.delivered=delivered;
exports.echo=echo;
//exports.postback=postback;
//exports.message=message;
exports.attachments=attachments;
exports.messageDistribution=messageDistribution;
exports.checkId=isThisMe;