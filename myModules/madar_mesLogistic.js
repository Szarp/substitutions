var request=require('request'),
    querystring = require('querystring');
var config = require('./configs/madar');
var mon = require('./mongoConnection.js');
//messenger
var template = require('./messTemplates.js');
//var mess = require('./messTemplates.js');
var messFunc = require('./messFunctions.js');
var secretToken = require('./secretTokenGenerator.js');
var setTime = require('./setTime.js');
var time = new setTime();
/*
webhookEvents
*/
var serverDB = new mon.server(config.db);
var userDB = new mon.user(config.db);
var subDB = new mon.substitutions(config.db);
var messenger = new messFunc.send(config.pageToken);
Date.prototype.localTime = function(){
   return this.getTime() - this.getTimezoneOffset()*1000*60/2;
}
//serverDB.init();
//subDB.collectionList(function(e,r){console.log(r)});
//subDB.remove("2017-12-14",function(e,r){console.log(r.result)});
//insertRandomMessages(10000);

//userDB.init();
//userDB.remove("userMessages",function(e,r){console.log(e,r.result)});
//subDB.find({},{},function(e,r){console.log(e,r)});

var madar = new messengerFunc(config.madarParams);
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
    	day='';
    var senderID=mess.sender;
    var tkn = text[1];
		if(!tkn){
            secretToken.messRequest(senderID, function(token){
				var txt = 'Wygenerowany token wipsz na domek.emadar.eu po zalogowaniu i kliknięciu właego zdjęcia profilowego w polu "Sprawdź token"\nTwój token to: ' + token;
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
							send(messageTS);
						});
					}
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
        console.log("Maybe thats ask for changes");
        if(text[0]=="info"){
            madar.sensor(text[1],function(res){
                var text=jsonToMessage(res);
                messFunc.preapreMessage('text', mess.sender, text, function (messageTS) {
                    messenger.send(messageTS);
                });
                console.log("res",res);
            })
        }
    }
    else{
        if(text[0]=="pomoc"||text[0]=="help"){
            console.log("user id",mess.sender);
            messenger.send(template.helpPage(mess.sender));
        }
        else if(text[0]=="status"){
            console.log("status");
            madar.status(function(res){
                console.log("res",res);
                var text=jsonToMessage(res);
                messFunc.preapreMessage('text', mess.sender, text, function (messageTS) {
                    messenger.send(messageTS);
                });
            })
            //console.log("user id",mess.sender);
            //messenger.send(template.helpPage(mess.sender));
        }
        else{
            console.log("Pop info about bad message to Admins");
        }
    }
}
function jsonToMessage(json){
    var text="";
    for(k in json){
        text+=k+" : "+json[k]+"\n";
    }
    return text;
}
function analizePostback(mess) {
    var payload = JSON.parse(mess.payload);
    switch(payload.type){
        case "example":
		messFunc.preapreMessage('text', mess.sender, 'Chcę sprawdzić zastępstwa na dzisaj dla klasy 1b:\n0 1b', function(messageTS){
			messenger.send(messageTS);
        });
        break;
        default:
        break;
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
function messengerFunc(configParams){
    var self=this
    sensorStatus.call(this,configParams);
    //this.test=function(){console.log("test")};
    this.status=function(callback){
        self.macList(function(list){
            if(list!= undefined){
                list=JSON.parse(list)["connection"];
                var connected=0;
                var disconnected=-1;
                for(k in list){
                    if(list[k]["RSSI"]!="")
                        connected++;
                    else
                        disconnected++;
                }
                setImmediate(function(){
                    callback({"connected":connected,"disconnected":disconnected});
                });
            }else{
                setImmediate(function(){
                    callback({});
                });
            }
                
        })
    }
}
function sensorStatus(configParams){
    var self=this;
    Madar.call(this,configParams);
    this.average=function(arr){
        arr=arr["values"][0];
        arr=arr.filter(function(el){return el != null})
        var sum=0
        for(k in arr)
            sum+=arr[k];
        return Math.floor(sum/arr.length*10)/10;
    }
    this.sensor=function(text,callback){
        var form={}
        self.convertName(text,function(sens){
            if(sens !== undefined){
                form["name"]=sens["name"]
                if(sens["RSSI"]!=""){
                    form["status"]="connected";
                    self.lastMeasure(sens["MAC"],function(data){
                        form["data"]=self.average(data);
                        setImmediate(function(){
                            callback(form);
                        });  
                    })
                }
                else{
                    form["status"]="disconnected";
                    setImmediate(function(){
                        callback(form);
                    });
                }
            }
            else{
                setImmediate(function(){
                        callback({"name":text,"status":"not found"});
                    });  
            }
        })
    }
    this.convertName=function(text,callback){
        self.macList(function(list){
            list=JSON.parse(list)["connection"];
            text=text.toLocaleLowerCase();
            var sensor;
            for(k in list){
                if(list[k]["name"].toLowerCase()==text || list[k]["MAC"].toLowerCase()==text){
                    sensor=list[k]
                    break;
                }
            }
            setImmediate(function(){
                callback(sensor);
            });  
        })
    }
    this.lastMeasure=function(macAddr,callback){
        var t= new Date().localTime();
        self.measure(macAddr,t-60*1000*20,t-60*1000*5,function(params){
            setImmediate(function(){
                callback(JSON.parse(params));
            });  
        });
    }
}
/*
var x = new Madar();
var time = new Date().localTime();
x.values("00280007",time-60*1000*8,time,function(el){
    el=JSON.parse(el)
    console.log(el);
    el=el.values;
    el.forEach(function(elem){
        console.log(elem.data);
    })
    //console.log("val",el);
})*/

function Madar(configParams){
    var self=this;
    this.dest="json.htm";
    this.name=configParams["name"];
    this.pass=configParams["pass"];
    this.url=configParams["url"];
    this.form={
        name:self.name,
        pass:self.pass,
        report:'data',
        mac:'002A0004',
        fromtime:1522064653-60*1000*10,
        tilltime:1522064653+60*1000*10,
        param:3,
        raster:6
    };
    this.request=function(parms,callback){
        request(self.prepareGet(parms), function (error, response, body) {
            setImmediate(function(){
                callback(body);
            });
        })
    }
    this.prepareGet=function(params){
        var string = self.url+"";
        string+=self.dest+'?';
        //console.log(string);
        for(k in params){
            string+=k+'='+params[k]+';';
        }
        return string;
    }
    this.macList=function(callback){
        var form={}
        form["name"]=self.name;
        form["pass"]=self.pass;
        form["report"]="connection";
        self.request(form,function(res){
            setImmediate(function(){
                callback(res);
            });
        })
    }
    this.values=function(macAddr,ftime,ttime,callback){
        var form=self.form;
        form["report"]="data";
        form["fromtime"]=ftime;
        form["tilltime"]=ttime;
        form["mac"]=macAddr;
        self.request(form,function(res){
            setImmediate(function(){
                callback(res);
            });  
        })        
    }
    this.measure=function(macAddr,ftime,ttime,callback){
        var form=self.form;
        form["report"]="measure";
        form["fromtime"]=ftime;
        form["tilltime"]=ttime;
        form["mac"]=macAddr;
        self.request(form,function(res){
            setImmediate(function(){
                callback(res);
            });  
        })        
    }
    this.deleteStatic=function(tab){
        var newTab=""
        for(var l=10;l<tab.length;l++){
            //if(l%2==0){
                newTab+=parseInt(tab[l], 16);
                newTab+=","
            //}
        }
        return newTab.slice(0,newTab.length-1);
    }
}
function test(callback){
    //var cookie=params['cookie'];
    	var url1='https://anulowano.pl:9001/webhook2';
    var form = {
        "object":"page",
        "entry":[
            {"id":"729532674508915",//pageID
             "time":1520265964263, //when message arrived
             "messaging":[
                 {"sender":{ //to whom
                     "id":"1765706666826061"},//my own id
                  "recipient":{//pageID
                      "id":"729532674508915"},//given by me
                  "timestamp":1520265963414,//when message was sent
                  "message":{
                      "mid":"mid.$cAADp-vjY5PxoKC7vllh9umnuRknk", //hash of message (not used)
                      "seq":679112, //number of message (not used)
                      "text":"<your-text>"}//text of message
                 }]
            }
        ]
    };/*
    var form={"object":"page","entry":[{"id":"729532674508915","time":1520265964263,"messaging":[{"sender":{"id":"1765706666826061"},"recipient":{"id":"729532674508915"},"timestamp":1520265963414,"message":{"mid":"mid.$cAADp-vjY5PxoKC7vllh9umnuRknk","seq":679112,"text":"<your-text>"}}]}]};*/
    //form=JSON.stringify(form);
    //console.log("form",form);
			//var formData = querystring.stringify(form);
			//var contentLength = formData.length;
			request({
				url: url1,
				json: form,
				method: 'POST'
			}, function (err, res, body) {
                console.log(res.body,body);
                //console.log(formData,contentLength);
				setImmediate(function() {
					if(err){
						callback(true, body);
					} else {
						callback(body.length<100,body);
					}
				});
			});
}
exports.delivered=delivered;
//exports.postback=postback;
//exports.message=message;
exports.attachments=attachments;
exports.messageDistribution=messageDistribution;
exports.checkId=isThisMe;
