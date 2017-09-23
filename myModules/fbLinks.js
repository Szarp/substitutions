var config=require('./config');
/*
This module contains functions to generate 
links to some facebook reqests

*/

    function messengerApi(userId){
        return 'https://graph.facebook.com/v2.6/'+userId+'?fields=first_name,last_name,profile_pic&access_token='+config.pageToken;
        
    }
    function loginAttempt(permissions){ //opens a facebook dialog window, returns code 
        var redirect='/redirect';
        return  'https://www.facebook.com/v2.8/dialog/oauth?'+'client_id='+config.clientId+'&redirect_uri='+config.url+redirect+'&scope='+permissions;
        /*
            https://www.facebook.com/v2.8/dialog/oauth?
            client_id={app-id}
            &redirect_uri={redirect-uri}
            &scopes={what u want to get permissions for}
        */
    }
    function userAccesToken(code){ //exchange code for Token
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
    function tokenInfo(token){ //information about token 
        return 'https://graph.facebook.com/debug_token?input_token='+token+'&access_token='+config.appToken;
        /*
             GET graph.facebook.com/debug_token?
             input_token={token-to-inspect}
             &access_token={app-token-or-admin-token}
        */
    }
function userInfo(token,params){  //information about user
    return 'https://graph.facebook.com/v2.8/me?access_token='+token+'&debug=all&fields='+params+'&format=json&method=get&pretty=0&suppress_http_code=1';
    
    
    /*
    https://graph.facebook.com/v2.8/me?
    access_token={user-token}&
    debug=all&
    fields=id,name& //A comma separated list of fields u want to know
    format=json&  
    method=get&   
    pretty=0&  //don't know what is it
    suppress_http_code=1  //don't know what is it
    
    */
}
function whiteListing(){
    return "https://graph.facebook.com/v2.6/me/thread_settings?access_token="+config.pageToken;
    /*
  POST "Content-Type: application/json" -d '{
  "setting_type" : "domain_whitelisting",
  "whitelisted_domains" : ["https://petersfancyapparel.com"],
  "domain_action_type": "add"
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=PAGE_ACCESS_TOKEN"
    */
    
}
function notification(id,message,redirect){ //send notification to user
    return 'https://graph.facebook.com/v2.8/'+id+'/notifications?access_token='+config.appToken+'&href='+redirect+'&template='+message;
     /*
     POST /{recipient_userid}/notifications?
     access_token={appToken}& 
     href={redirect}& 
     template={message}
     
     */
}
function tokenToLong(shortToken){ //exchange short to long-life token
    return 'https://graph.facebook.com/oauth/access_token?client_id='+config.clientId+'&client_secret='+config.appSecret+'&grant_type=fb_exchange_token&fb_exchange_token='+shortToken;
    /*
    https://graph.facebook.com/oauth/access_token?             
    client_id=APP_ID&
    client_secret=APP_SECRET&
    grant_type=fb_exchange_token&
    fb_exchange_token=EXISTING_ACCESS_TOKEN 
    */
}   
    exports.loginAttempt = loginAttempt;
    exports.userAccesToken = userAccesToken;
    exports.tokenInfo = tokenInfo;
    exports.userInfo = userInfo;
    exports.notification = notification;
    exports.tokenToLong = tokenToLong;
    exports.messengerApi = messengerApi;
    exports.whiteListing = whiteListing;