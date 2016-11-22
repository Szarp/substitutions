var config = require('./config');
var request = require('request');
var mongo = require('./mongoFunctions.js');
var link = require('./fbLinks.js');
//var link=new linka();
/*
Make requests to facebook server

*/
function createPersonToken(code,callback){
    
    request(link.userAccesToken(code), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        //console.log('body',JSON.parse(body)); // Show the HTML for the Modulus homepage.
        setImmediate(function() {
                callback(JSON.parse(body)['access_token']);
        });
    });
}
function checkIfLongTokenExist(id,callback){
    mongo.findById(id,'person',function(personInfo){
        var returnInfo='sas';
        /*
        if(personInfo['long-token']){
            var time =new Date.time;
            if(personInfo['expiration']-time>0){
            returnInfo='ok';
            }
        }
        else{ returnInfo='create long token'}
        
        //console.log(personInfo);
        */
        setImmediate(function() {
                callback(returnInfo);
        });
        
    })   
}
/*
function readPersonalSettings(id,callback){
    var collection = 'person';
    console.log(id);
        mongo.findById(id,collection,function(err,doc){
            console.log('err',err);
            console.log('doc',doc);
            setImmediate(function() {
                callback(doc['settings']);
            });
        });
}

function savePersonalSettings(id,params,callback){
    var collection = 'person';
        mongo.modifyById(id,collection,{settings:params},function(){})
}
*/

function savePerson(id,token,callback){
    var collection = 'person';
    mongo.findById(id,collection,function(err,doc){
        console.log('doc',doc);
        if(!doc){
            mongo.save([collection,{_id:id,token:token,settings:'',name:''}],function(){
                console.log('person saved');
                setImmediate(function() {
                    callback();
                });    
            });
        }
        else{
            console.log('person was before');
            setImmediate(function() {
                callback();
            });  
        }
    });

    
}
function tokenToLongLife(shortToken,callback){
   // console.log(link.linkLongLifeToken(shortToken));
     request(link.tokenToLong(shortToken), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        //console.log('body',JSON.parse(body)); // Show the HTML for the Modulus homepage.

        setImmediate(function() {
                callback(body);
        });
    });
    
}
function personalData(token,params,callback){
    request(link.userInfo(token,params), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        //console.log('body',JSON.parse(body)); // Show the HTML for the Modulus homepage.
        setImmediate(function() {
                callback(body);
        });
    });
}
function createNotification(id,message,redirect,callback){
    var url=link.notifcation(id,message,redirect);
    request({
        headers: {
          'Content-Length': 0,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: url,
        body: '',
        method: 'POST'
      },function (e, r, body) {
            if(e){console.log('req problem: '+e);}
            setImmediate(function() {
                callback(body);
            });
            //console.log(body);  
        }
    );
}
function getInfoAboutToken(accessToken,callback){
    request(link.tokenInfo(accessToken), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        setImmediate(function() {
                callback(JSON.parse(body));
        });
    });
}

exports.personalData = personalData;
exports.createNotification = createNotification;
exports.tokenToLongLife = tokenToLongLife;
exports.checkIfLongTokenExist = checkIfLongTokenExist;
exports.getInfoAboutToken=getInfoAboutToken;
exports.savePerson=savePerson;
exports.createPersonToken=createPersonToken;
//exports.savePersonalSettings=savePersonalSettings
//exports.readPersonalSettings=readPersonalSettings
//exports.links=links;