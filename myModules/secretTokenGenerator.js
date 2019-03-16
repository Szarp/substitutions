const mongo3 = require("./mongoFunctions3");

//ret: boolen true if tokens matches
function appCheck(appId,token,callback){ //authorization of tokens
    //appId String
    //token number
    var medium = 'messengerPerson';
        matchTokens(medium,token,function(match){
            if(match != null){
                connectAcconts(appId,match,function(){
                    setImmediate(function(){
                        callback(true);
                    });
                })
            }
            else{
                setImmediate(function(){
                    callback(false);
                });
            }
        });
    }
//ret: boolen true if tokens matches
function messCheck(messId,token,callback){ //authorization of tokens form Messenger
    //appId String
    //token number
    var medium = 'person';
        matchTokens(medium,token,function(match){
            if(match != null){
                connectAcconts(match,messId,function(){
                    setImmediate(function(){
                        callback(true);
                    });
                })
            }
            else{
                setImmediate(function(){
                    callback(false);
                });
            }
        });
    }
//ret: String token
function appRequest(appId,callback){ //request for token from app
    //appId String
    var medium = 'person';
    saveAndGenerate(medium,appId,function(token){
        setImmediate(function(){
            callback(token);
        });
    });
}
//ret: String token
function messRequest(appId,callback){ //request for token from Messenger
    //appId String
    var medium = 'messengerPerson';
    saveAndGenerate(medium,appId,function(token){
        setImmediate(function(){
            callback(token);
        });
    });
}
//ret: ()
function connectAcconts(appId, messId, callback) { //connect acconts by id
    //id String
    mongo3.modifyById(messId, "messengerPerson", { "system.connected": true }, function (err) {
        if (err) console.error(err);
        mongo3.modifyById(appId, "person", { "system.connected": true, "personal.id": messId }, function (err1) {
            if (err1) console.error(err1);
            // If there is an error it should be passed to callback, but current code would ignore it...
            setImmediate(function () {
                callback();
            });
        });
    });
}

//ret: String id or null
function matchTokens(medium, token, callback) { //checking if exist same tokens
    //medium string {person; messengerPerson}
    //token number
    //searching by secret token
    mongo3.findByParam({ "system.connected": false, "system.secret.token": token }, { "system.secret": 1 }, medium, function (err, a) {
        //console.log('is thre some person',a[0]);
        if (!err && a && a.length == 1) { //if exist one element
            var person = a[0].system.secret;
            //console.log('is there token',person);
            var time = new Date().getTime()
            if (person.time - time > 0) { //if expiration time is longer
                console.log('how about time');
                setImmediate(function () {
                    //console.log(buttons);
                    callback(a[0]._id);
                });
            }
            else {
                setImmediate(function () {
                    //console.log(buttons);
                    callback(null);
                });
            }
        }
        else {
            if(err) console.error(err);
            setImmediate(function () {
                //console.log(buttons);
                callback(null);
            });
        }
    });
}

//ret: token secret
function saveAndGenerate(medium,userId,callback){ //saving new token to id form medium
    //medium string {person; messengerPerson}
    //id string
    mongo3.findById(userId,medium,function(e,doc){ //protection for neer-time-tokens
        if(e){
            console.error(e);
            setImmediate(function () {
                callback("Wystąpił błąd :'( Spróbuj ponownie później");
            });
        }
        console.log(doc);
        if(doc != null && doc != undefined){
        if(doc.system.secret != ''){
            var time = new Date().getTime()+1000*60*60*24;
            var lastTime = doc.system.secret.time;
            if(time-lastTime>1000*60*5){ //wait 5 min after creation newer
                tokenGenerator(function (secret) {
                    mongo3.modifyById(userId, medium, { "system.secret": secret }, function (err) {
                        if (!err) {
                            setImmediate(function () {
                                callback(secret.token);
                            });
                        } else {
                            console.error(err);
                            setImmediate(function () {
                                callback("Wystąpił błąd :'( Spróbuj ponownie później");
                            });
                        }
                    });
                });
            }
            else{
                setImmediate(function(){
                    callback(doc.system.secret.token);
                });
            }
        }
        else{
            tokenGenerator(function (secret) {
                mongo3.modifyById(userId, medium, { "system.secret": secret }, function (err) {
                    if (!err) {
                        setImmediate(function () {
                            callback(secret.token);
                        });
                    } else {
                        console.error(err);
                        setImmediate(function () {
                            callback("Wystąpił błąd :'( Spróbuj ponownie później");
                        });
                    }
                });
            });
        }
        }else{
           callback("An error occured (db, token, line 121 - doc is null/undefined) please contact admins and send them this message (use '2 your_report_message' eg. '2 coś padło, pomóżcie' to report this error or tell them directly)");
        }
    });
}
//ret: array with secret and time
function tokenGenerator(callback){  //generates secret token and adds time
    var time = new Date().getTime()+1000*60*60*24;
    var index = Math.floor(Math.random()*100000);
    setImmediate(function(){
		callback({token:index,time:time});
	});
}
exports.appCheck = appCheck;
exports.messCheck = messCheck;
exports.appRequest = appRequest;
exports.messRequest = messRequest;
exports.matchTokens = matchTokens;
exports.saveAndGenerate = saveAndGenerate;
exports.tokenGenerator = tokenGenerator;
exports.connectAccounts = connectAcconts;
