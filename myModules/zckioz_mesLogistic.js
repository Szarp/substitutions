//global
var request=require('request');
var config = require('./configs/zckoiz');
var mess = require('./messTemplates.js');
var mon = require('./mongoConnection.js');
//messenger
var template = require('./messTemplates.js');
var messFunc = require('./messFunctions.js');
var secretToken = require('./secretTokenGenerator.js');
var setTime = require('./setTime.js');
var time = new setTime();

var serverDB = new mon.server(config.db);
var userDB = new mon.user(config.db);
var subDB = new mon.substituions(config.db);
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
                analizePostback(mess);
                serverDB.save(mess,function(e,r){
                     if(!e){
                        console.log('Saving  users\'s message',r["result"]);    
                    }
                    else{
                        console.log("Error in saving users\'s message",e);
                    }
                });
            }
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
                //console.log('check if attachments or text');
                if(!mess["attachments"]){
                    analizeText(mess);
                    //console.log("text",mess);
                }
                else{
                    //analizeAttachments(mess);
                    //console.log("atta",mess);
                }
                userDB.save(mess,function(e,r){
                    if(!e){
                        console.log('Saving users\'s message',r["result"]);    
                    }
                    else{
                        console.log("Error in saving user\'s message",e);
                    }
                })
                //console.log('Saving to users\'s message');
            }
        break;
            //do something else    
    }
}
function analizeText(mess){
    mess=mess.toLowerCase();
    var text = mess.text.split(' ');
    if(text.length == 2){
        //console.log("Maybe thats ask for changes");
        ifChanges(text,function(changes,weekDay){
            console.log('chnages',changes);
            if(changes){
                if(changes.length>0){
                messFunc.prepareBtn([['postback','{"type":"changes","day":"'+text[0]+'","class":"'+text[1]+'"}', 'Wyślij na czacie']], function(buttons){
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
            messenger.send(template.helpPage(mess.sender));
        }
        else{
            console.log("Pop info about bad message to Admins");
        }
    }
}
function analizePostback(mess) {
    var payload = JSON.parse(mess.payload);
    switch(payload.type){
        case "example":
		messFunc.preapreMessage('text', mess.sender, 'Chcę sprawdzić zastępstwa na dzisaj dla klasy 1b:\n0 1b', function(messageTS){
			messenger.send(messageTS);
        });
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
function messageLogistic(params,event){
    var mess={}
    mess["timestamp"]=event.timestamp;
    mess["sender"]=event.sender.id;
    mess["page"]=event.recipient.id;
    mess["type"]="";
    //console.log('begin');
    //switch(true){
        if(params.attachments == true){
            mess["type"]="attachments";
            mess["attachments"]=event.message.attachments;
            //console.log('    got attachments')
        }
        if(params.text == true){
            mess["type"]="text";
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
var mongoSub = new mon.zckoizSubstitutions(config.db);
//getChanges(function(){})
function getChanges(callback){
    request("http://www.zckoiz.zabrze.pl/zastepstwa",function(err,res,body){
        var convert = new zckioz(body);
        convert.init();
        mongoSub.save(assignId(convert.toSave),function(){
            setImmediate(function(){
                callback();
            });
        });
	});
}
function assignId(preparedData){
    var data =preparedData.substitution.map(function(el){
        return el.className;
    })
    var classList=[];
    for(var j =0;j<data.length;j++){
        if(classList.indexOf(data[j])==-1){
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
            text = el["text"];
            el["lessonNum"]=self.lessonNum(text);
            el["className"]=self.findClass(text);
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
    mongoSub.find({_id:time.reverseTime()},{},function(e,obj){//console.log(e,obj)
        if(obj[0]!==undefined){
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
    });
}
exports.subs = getChanges;
exports.messengerChanges=changesForMessenger;
//exports.delivered=delivered;
//exports.echo=echo;
//exports.postback=postback;
//exports.message=message;
//exports.attachments=attachments;
exports.messageLogistic=messageLogistic;
exports.checkId=isThisMe;