var config = require('/home/bartek/2016/config');
var request = require('request');
var mongo = require('./mongoFunctions.js');
var link = require('./fbLinks.js');
//var link=new linka();
function createPersonToken(code,callback){
    
    request(link.linkToUserAccesToken(code), function (e, r, body){
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
function saveIdAndAccesToken(id,token,callback){
    var collection = 'person';
    mongo.save([collection,{_id:id,token:token}],function(){
        setImmediate(function() {
                callback();
        });    
    });
    
}
function tokenToLongLife(shortToken,callback){
   // console.log(link.linkLongLifeToken(shortToken));
     request(link.linkLongLifeToken(shortToken), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        //console.log('body',JSON.parse(body)); // Show the HTML for the Modulus homepage.

        setImmediate(function() {
                callback(body);
        });
    });
    
}
function personalData(token,callback){
    request(link.linkInfoAboutUser(token), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        //console.log('body',JSON.parse(body)); // Show the HTML for the Modulus homepage.

        setImmediate(function() {
                callback(body);
        });
    });
}
function createNotification(id,token,callback){
    var url=link.linkNotifcation(id,token);
    request({
        headers: {
          'Content-Length': 0,
          'Content-Type': 'application/x-www-form-urlencoded'
            
        },
        uri: url,
        body: '',
        method: 'POST'
      }, function (err, res, body) {
        //assert.equal(null,err);
            setImmediate(function() {
                callback(body);
            });
            //console.log(body);
        
      });
    //https://graph.facebook.com/v2.8/
    
    
    
    /*
POST /{recipient_userid}/notifications?
     access_token=...& 
     href=...& 
     template=You have people waiting to play with you, play now!
     
     */
}



function getInfoOfToken(accessToken,callback){
    
    request(link.linkToInfoAboutToken(accessToken), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        //console.log('body',body); // Show the HTML for the Modulus homepage.
        setImmediate(function() {
                callback(JSON.parse(body));
        });
    });
}
exports.personalData = personalData;
exports.createNotification = createNotification;
exports.tokenToLongLife = tokenToLongLife;
exports.checkIfLongTokenExist = checkIfLongTokenExist;
exports.getInfoOfToken=getInfoOfToken;
exports.saveIdAndToken=saveIdAndAccesToken;
exports.createPersonToken=createPersonToken;
//exports.links=links;