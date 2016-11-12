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
function linkInfoAboutUser(token){
    return 'https://graph.facebook.com/v2.8/me?access_token='+token+'&debug=all&fields=id%2Cname%2Cemail&format=json&method=get&pretty=0&suppress_http_code=1';
    
    
    /*
    https://graph.facebook.com/v2.8/me?access_token=EAACEdEose0cBABvfHPvsavysXLoutiwZBHg6D60OrZAz5PpG0LUK9befRluY574XWuC18JeRyTUxLvaTIQMrgcqvHwWnePAZA34AIjGKFXCcIc5NTtJ3OdhxB678Moc0nNFk1rlkEn2ZBDQM6MubNxEZBigJZBJmrh5m0tgBq2iwZDZD&debug=all&fields=id%2Cname&format=json&method=get&pretty=0&suppress_http_code=1
    
    */
}
function linkLongLifeToken(shortToken){
    var link = 'https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&amp;client_id='+config.clientId+'&amp;client_secret='+config.appSecret+'&amp;fb_exchange_token='+shortToken;
    console.log(link);
    return link;
    
    /*
    GET /oauth/access_token?  
    grant_type=fb_exchange_token&amp;           
    client_id={app-id}&amp;
    client_secret={app-secret}&amp;
    fb_exchange_token={short-lived-token} 
    */
}
function linkNotification(id,tokenn){
    return 'https://graph.facebook.com/v2.8/'+id+'/notifications?access_token='+config.appToken+'&href=http://192.166.218.253:8088/&template=You have people waiting to play with you, play now!';
    
    
}
function link2(token){
    return 'https://graph.facebook.com/oauth/access_token?client_id='+config.clientId+'&client_secret='+config.appSecret+'&grant_type=fb_exchange_token&fb_exchange_token='+token;
    /*
    https://graph.facebook.com/oauth/access_token?             
    client_id=APP_ID&
    client_secret=APP_SECRET&
    grant_type=fb_exchange_token&
    fb_exchange_token=EXISTING_ACCESS_TOKEN 
    */
}   
    exports.linkInfoAboutUser = linkInfoAboutUser;
    exports.linkNotifcation = linkNotification;
    exports.linkToCreateCode = linkToCreateCode;
    exports.linkToUserAccesToken = linkToUserAccesToken;
    exports.linkToInfoAboutToken = linkToInfoAboutToken;
    exports.linkLongLifeToken = link2;//linkLongLifeToken;