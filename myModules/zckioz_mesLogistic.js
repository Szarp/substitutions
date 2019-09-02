//global
var request=require('request');
var config = require('./configs/zckoiz');
var mess = require('./messTemplates.js');
const mongo3 = require("./mongoFunctions3");
//messenger
var template = require('./messTemplates.js');
var messFunc = require('./messFunctions.js');
var secretToken = require('./secretTokenGenerator.js');
var setTime = require('./setTime.js');
var time = new setTime();

var messenger = new messFunc.send(config.pageToken);
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

                let obj = { messages: {} };
                obj.messages[mess["timestamp"]] = mess;
                mongo3.modifyById("serverMessages", "serverMessages", obj, function (e, r) {
                     if(!e){
                        console.log('Saving users\'s message',r);
                         if(r.lastErrorObject && r.lastErrorObject.n !=0){
                            analizePostback(mess);
                         }
                    }
                    else{
                        console.log("Error in saving users\'s message",e);
                    }
                }, config.db);
            }
        break;
        default:
            if(mess["echo"]==true){
                //console.log('Saving to user message');
                let obj = { messages: {} };
                obj.messages[mess["timestamp"]] = mess;
                mongo3.modifyById("serverMessages", "serverMessages", obj, function (e, r) {
                    if(!e){
                        console.log('Saving server\'s message',r);
                    }
                    else{
                        console.log("Error in saving server\'s message",e);
                    }
                }, config.db);
            }
            else{
                let obj = {messages: {}};
                obj.messages[mess["timestamp"]] = mess;
                mongo3.modifyById("userMessages", "userMessages", obj, function(e,r){
                    if(!e){
                        if(!mess["attachments"]){
                            if(r.lastErrorObject && r.lastErrorObject.n !=0){
                                analizeText(mess);
                            }
                    }
                    else{
                        //analizeAttachments(mess);
                        //console.log("atta",mess);
                    }
                            console.log('Saving users\'s message',r);
                        }
                        else{
                            console.log("Error in saving user\'s message",e);
                        }
                }, config.db);
                //console.log('Saving to users\'s message');
            }
        break;
    }
}
function analizeText(mess){
    mess.text=mess.text.toLowerCase();
    var text = mess.text.split(' ');
    if(text.length == 2){
        //console.log("Maybe thats ask for changes");
        ifChanges(text,function(changes,weekDay){
            console.log('chnages',changes);
            if(changes){
                if(changes.length>0){
                messFunc.prepareBtn([['postback','{"type":"changes","day":"'+text[0]+'","class":"'+text[1]+'"}', 'Wyślij na czacie'],['postback','{"type":"changes","day":"'+text[0]+'","class":"'+text[1]+'"}', 'Wyślij na czacie']], function(buttons){
                        //com += ' Są zastępstwa dla klasy ' + text[1];
                        var content={
                            text:'Zastępstwa na '+weekDay+' dla klasy ' + text[1],
                            buttons: buttons
                        }
                        messFunc.preapreMessage('generic', mess.sender, content, function(messageTS){
                            messenger.send(messageTS);
                        });
                    });
                }
                else{
                    messFunc.preapreMessage('text', mess.sender,'Brak zastępstw na '+weekDay+' dla klasy '+ text[1], function(messageTS){
                    messenger.send(messageTS);
                    })
                }
            }
        });
    }
    else{
        if(text[0]=="pomoc"||text[0]=="help"){
            console.log("user id",mess.sender);
            messenger.send(template.helpPage_zckoiz(mess.sender));
            //messenger.send(template.test(mess.sender));
        }
        else if(text[0]=="news"||text[0]=="aktualnosci"){
            messFunc.prepareBtn([['postback','{"type":"changes","day":"'+text[0]+'","class":"'+text[0]+'"}', 'Wyślij na czacie'],['postback','{"type":"info","class":"seba"}', 'THE NIGHT SPRINGS']], function(buttons){
                        //com += ' Są zastępstwa dla klasy ' + text[1];
                        var content={
                            text:'Zastępstwa na  dla klasy ' + text[0],
                            buttons: buttons
                        }
                        messFunc.preapreMessage('generic', mess.sender, content, function(messageTS){
                            messenger.send(messageTS);
                        });
                    });
            //console.log("user id",mess.sender);
            //messenger.send(template.helpPage_zckoiz(mess.sender));
            //messenger.send(template.test(mess.sender));
        }
        else if(text[0]=="konkurs"){
            messFunc.preapreMessage('text', mess.sender,testText, function(messageTS){
                    messenger.send(messageTS);
                    })
            //console.log("user id",mess.sender);
            //messenger.send(template.helpPage_zckoiz(mess.sender));
            //messenger.send(template.test(mess.sender));
        }
        else{
            console.log("Pop info about bad message to Admins");
        }
    }
}
function analizePostback(mess) {
    var testText ="The Night Springs z naszej szkoły ma szansę zagrać na festiwalu. Głosowanie jest całkowicie darmowe, sms to jedynie forma weryfikacji głosu(btw możesz codziennie głosować)\n Link do strony: https://lifeonstage.onet.pl/1062/zespol.html \n\nFanpage:https://www.facebook.com/TheNightSprings/ \n\nJak to bot oczywiście umożliwia automatyczne głosowanie, podaj nr telefonu (otrzymasz sms) i odeślij nam otrzymany nr!!\n(strona słabo działa na smartfonach :-( )";
    var payload = JSON.parse(mess.payload);
    switch(payload.type){
        case "example":
		messFunc.preapreMessage('text', mess.sender, 'Chcę sprawdzić zastępstwa na dzisaj dla klasy 1b:\n0 1b', function(messageTS){
			messenger.send(messageTS);
        });
        break;
        case "info":
            if(payload.class=="seba"){
                messFunc.preapreMessage('text', mess.sender, testText, function(messageTS){
                    messenger.send(messageTS);

                });
            }
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
        default:
        break;
    }
}
function commandValidation(text){
    text[1]=text[1].toUpperCase();
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
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
/* -----------------------------------------------------*/
//zckioz school communication
//getChanges(function(){})
function getChanges(callback){
    request("http://www.zckoiz.zabrze.pl/zastepstwa",function(err,res,body){
		if(!err && body){
			var convert = new zckioz(body);
			convert.init();
            mongo3.modifyById(assignId(convert.toSave), "substitutions", function (err) {
                if (err) console.error(err);
				setImmediate(function(){
					callback();
				});
			}, config.db);
		} else if(err){
			console.error("An error occured while downloading data (ZCKOIZ):", err);
		} else {
			console.error("An error occured while downloading data (ZCKOIZ): body is undefined");
		}
	});
}
function assignId(preparedData){
    var data =preparedData.substitution.map(function(el){
        return el.className;
    })
    var classList=[];
    for(var j =0;j<data.length;j++){
        if(classList.indexOf(data[j])==-1 && data[j]){
            classList[classList.length]=data[j].replace(" ","");//special space
        }
    }
    preparedData["_id"]=preparedData.date;
    preparedData["classList"]=classList;
    return preparedData;
}
//mongoSub.find({_id:'26-02-2018'},{substitution:true},function(e,r){console.log(r[0].substitution)});
//mongoSub.remove("26-02-2018",function(e,r){console.log(e,r.result)});
function zckioz(body){
    var self = this;
    this.url="http://www.zckoiz.zabrze.pl/zastepstwa";
    this.rawChanges=[];
    this.day="";
    this.toSave=""
    this.init=function(){
        self.convertText(body);
        self.clearBlank();
        self.getDay();
        self.splitText();
        self.toSave=self.save();
    }
    this.save=function(){
        return {substitution:self.rawChanges,date:self.day.date}
    }
    this.convertText=function(text){
        var teacher="";
         text.split("<p").forEach(function(el){
            if (el.length<100){
                el = el.replace("</p>","");
                el = el.replace(/[\n\r]/g,"");// \n and \r deletion
                el = el.substr(1);
                 if(el.indexOf("<strong>")>-1){
                     el = el.split("strong")[1];
                     el = el.substr(1);
                     el = el.replace("</","");
                     self.rawChanges.push([el]);
                     //console.log(el)
                 }
                 else if(el.indexOf("<u>")>-1){
                     el = el.replace("<u>","");
                     el = el.replace("</u>","");
                     teacher = el;
                     //console.log("Nauczyciel",el);
                 }
                 else{
                     self.rawChanges.push({text:el,teacher:teacher});
                 }
            }
         });
    }
    this.clearBlank=function(){
        var elems =  self.rawChanges;
        var pat=['',' '];//some special charakter too
        self.rawChanges = self.rawChanges.filter(function(el){
            for(i in el){
                if(el[i]==pat[0] || el[i]==pat[1]){
                    el = null;
                    //console.log(el[i]);
                    return el !== null;
                }
            }
            return el;
        });
    }
    this.getDay=function(){
        var text = self.rawChanges[0][0];
        text = text.split(" ");
        self.day={dayName:text[0],date:text[1].replace(/[\.]/g,"-")}
        self.rawChanges = self.rawChanges.slice(1);
    }
    this.splitText=function(){
        var text=""
        self.rawChanges.map(function(el){
            if(el.text){
                text = el["text"];
                el["lessonNum"]=self.lessonNum(text);
                el["className"]=self.findClass(text);
            }
            return el;
        })
    }
    this.lessonNum=function(text){
        var index = text.indexOf(".");
        return self.classToNumber(text.substr(0, index));
    }
    this.classToNumber = function(text){
        var nums=text.split("-");
        //console.log('nums',nums);
        nums = nums.map(function(el){return Number(el);});
        //console.log('numsMAp',nums);
        var allNums=[];
        if(nums.length>1){
            for(var i=nums[0];i<=nums[1];i++){
                //console.log(i)
                allNums.push(i);
            }
            return allNums;
        }
        else{
            return nums
        }
    }
    this.findClass=function (text){
        var beg = text.indexOf(".");
        var end = text.indexOf("–");//special charcode for -
        return text.slice(beg+1, end-1).replace(" ","");
    }
}
function changesForMessenger(reqClass,day,callback){ //response Messenger's format changes
    //reqClass String [class]
    //day String [today;tommorow]
    //getChanges({param:day},function(obj,weekDay){
    if(day=='today'){
        time.todayIs();
    } else if(day=='TDAT'){
		time.theDayAfterTomorrowIs();
	} else {
        time.tommorowIs();
    }
    var day = time.displayWeekDay();
    mongo3.findByParam({ _id: time.reverseTime() }, {}, "substitutions", function (e, obj) {//console.log(e,obj)
        if (e) console.error(e);
        if(obj && obj[0]!==undefined){
            obj=obj[0];
            var tableOfMesseges=[];
            var msg = "";
            //console.log(obj);
            if(obj['substitution'] != 'no substitutions'){
                var subs = obj['substitution'];
                //console.log(subs)
                for(var i = 0; i < subs.length; i++){
                    var oneSub = subs[i];
                    var classID = oneSub.className;

                    if(reqClass == classID){
                        msg+=oneSub.teacher+"\n";
                        msg+=oneSub.text;
                        tableOfMesseges[tableOfMesseges.length]=msg;
                        msg='';
                    }
                }
            }
            setImmediate(function() {
                callback(tableOfMesseges,day);
            });
        }
        else{
            setImmediate(function() {
                callback([],day);
            });
        }
    }, config.db);
}
exports.subs = getChanges;
exports.messengerChanges=changesForMessenger;
//exports.delivered=delivered;
//exports.echo=echo;
//exports.postback=postback;
//exports.message=message;
//exports.attachments=attachments;
exports.messageDistribution=messageDistribution;
exports.checkId=isThisMe;
