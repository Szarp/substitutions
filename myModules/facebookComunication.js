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

function saveIdAndAccesToken(id,token,callback){
    var collection = 'person';
    mongo.save([collection,{_id:id,token:token}],function(){
        setImmediate(function() {
                callback();
        });    
    });
    
}
function tokenToLongLife(shortToken,callback){
     request(link.linkLongLifeToke(shortToken), function (e, r, body){
        if(e){console.log('req problem: '+e);}
        //console.log('body',JSON.parse(body)); // Show the HTML for the Modulus homepage.
        setImmediate(function() {
                callback(JSON.parse(body));
        });
    });
    
}

function createNotification(){
    
    
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


exports.getInfoOfToken=getInfoOfToken;
exports.saveIdAndToken=saveIdAndAccesToken;
exports.createPersonToken=createPersonToken;
//exports.links=links;