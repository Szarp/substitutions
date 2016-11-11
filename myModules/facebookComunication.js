//var config = require('/home/madar/2016/config');
var config = require('./config');
var mongo = require('./mongoFunctions.js');

var link = links();
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
                callback(body);
        });
    });
}

function links(){
    
    this.linkToCreateCode=function(){
        var redirect='/redirect';
        return  'https://www.facebook.com/v2.8/dialog/oauth?'+'client_id='+config.clientId+'&redirect_uri='+config.url+redirect;
        /*
            https://www.facebook.com/v2.8/dialog/oauth?
            client_id={app-id}
            &redirect_uri={redirect-uri}
        */
    }
    this.linkToUserAccesToken=function(code){
        var redirect='/redirect';
        return 'https://graph.facebook.com/v2.8/oauth/access_token?'+ 'client_id='+config.clientId+'&redirect_uri='+config.url+redirect+'&client_secret='+config.appSecret+'&code='+code;
        
       /*
           GET https://graph.facebook.com/v2.8/oauth/access_token?
           client_id={app-id}
           &redirect_uri={redirect-uri}
           &client_secret={app-secret}
           &code={code-parameter}
       */
    }
    this.linkToInfoAboutToken=function(token){
        return 'https://graph.facebook.com/debug_token?input_token='+token+'&access_token='+config.appToken;
        /*
             GET graph.facebook.com/debug_token?
             input_token={token-to-inspect}
             &access_token={app-token-or-admin-token}
        */
    }
    
}
exports.getInfoOfToken=getInfoOfToken;
exports.saveIdAndToken=saveIdAndAccesToken;
exports.createPersonToken=createPersonToken;
exports.links=links;