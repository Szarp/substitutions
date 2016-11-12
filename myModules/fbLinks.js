var config=require('/home/bartek/2016/config');
    
    function linkToCreateCode(){
        var redirect='/redirect';
        return  'https://www.facebook.com/v2.8/dialog/oauth?'+'client_id='+config.clientId+'&redirect_uri='+config.url+redirect;
        /*
            https://www.facebook.com/v2.8/dialog/oauth?
            client_id={app-id}
            &redirect_uri={redirect-uri}
        */
    }
    function linkToUserAccesToken(code){
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
    function linkToInfoAboutToken(token){
        return 'https://graph.facebook.com/debug_token?input_token='+token+'&access_token='+config.appToken;
        /*
             GET graph.facebook.com/debug_token?
             input_token={token-to-inspect}
             &access_token={app-token-or-admin-token}
        */
    }
function linkLongLifeToken(shortToken){
    return 'https://graph.facebook.com/oauth/access_token?  grant_type=fb_exchange_token&amp;client_id='+config.clientId+'&amp;client_secret='+config.appSecret+'&amp;fb_exchange_token='+shortToken;
    
    /*
    GET /oauth/access_token?  
    grant_type=fb_exchange_token&amp;           
    client_id={app-id}&amp;
    client_secret={app-secret}&amp;
    fb_exchange_token={short-lived-token} 
    */
}
    
    exports.linkToCreateCode = linkToCreateCode;
    exports.linkToUserAccesToken = linkToUserAccesToken;
    exports.linkToInfoAboutToken = linkToInfoAboutToken;
    exports.linkLongLifeToken = linkLongLifeToken;