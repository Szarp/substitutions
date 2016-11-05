var express = require('express'),
    fs= require('fs'),
    https =require('https'),
    querystring = require('querystring'),
    //http = require('http'),
    //userMod = require(__dirname +'/myModules/getSubstitution.js'),
   // jsonFromHtml = require(__dirname +'/myModules/getJsonFromHtml.js'),
    //setDate = require(__dirname +'/myModules/setDate.js'),
    myFunc = require(__dirname+'/myModules/serverReqests.js'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
        request= require('request'),
    //MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    mongo=require(__dirname+'/myModules/mongoFunctions.js'),
    setTime = require(__dirname+'/myModules/setTime.js'),
    config = require('/home/madar/2016/config');
   // querystring = require('querystring');
///Users/bartek/gitrepo/node/substitution/myModules/serverReqest.js'
//var substitution =new jsonFromHtml();
//var user= new userMod();
var app = express();
//'Users/bartek/Documents/2016/
//var https = require('https');
//var app = express();
/*
POST /{recipient_userid}/notifications?
     access_token=...& 
     href=...& 
     template=You have people waiting to play with you, play now!
     /home/madar/2016/wsskey.pem
     /home/madar/2016/wsscert.pem
     /home/madar/2016/cacert.pem
     
*/
var x=new createReqest();
//appSetting();
var opts = {
   
  // Specify the key file for the server
  key: fs.readFileSync('/home/madar/2016/wsskey.pem'),
   
  // Specify the certificate file
  cert: fs.readFileSync('/home/madar/2016/wsscert.pem'),
   
  // Specify the Certificate Authority certificate
  ca: fs.readFileSync('/home/madar/2016/cacert.pem'),
   
  // This is where the magic happens in Node.  All previous
  // steps simply setup SSL (except the CA).  By requesting
  // the client provide a certificate, we are essentially
  // authenticating the user.
  //requestCert: true,
   
  // If specified as "true", no unauthenticated traffic
  // will make it to the route specified.
  //rejectUnauthorized: true
};
//var app = module.exports = express.createServer(opts);
var time = new setTime();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // for parsing
app.use(cookieParser());
app.use(function (req, res, next) {
  // check if client sent cookie
    var cookie = req.cookies.cookieName;
    if (cookie === undefined){
        // no: set a new cookie
        var randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
        //console.log('cookie created successfully');
    } 
    else{
    // yes, cookie was already present 
       // console.log('cookie exists', cookie);
    } 
    next(); // <-- important!
});

//1082740245094082
app.get('/', function (req, res) {
   // asf();
        //res.redirect('https://www.facebook.com/v2.8/dialog/oauth?client_id=1082740245094082&redirect_uri=https://192.166.213.253:8088/redirect');
        res.sendFile( __dirname + '/public/substitutionPage.htm');
    
});
app.post('/getData',function(req,res){
    console.log(req.body);
    if(req.body['mode']=='today'){
        time.todayIs();
        
    }
    if(req.body['mode']=='tommorow'){
        time.tommorowIs();
        
    }
    var getChangesToSend=time.displayTime();
    //console.log('time',getChangesToSend);
    mongo.findById(getChangesToSend,'substitutions',function(obj){
       res.send(JSON.stringify(obj['substitution'])); 
    });
    //console.log('hi');
    
    //console.log(req.body);
    //res.send(JSON.stringify(exData));
})

app.post('/', function (req, res) {
    console.log(req.body);
        res.redirect('https://www.facebook.com/v2.8/dialog/oauth?client_id=1082740245094082&redirect_uri=https://192.166.213.253:8088/redirect');
    //res.sendFile( __dirname + '/public/fbIndex.html');
    //var a=userMod.changes();
    //us.changes();
   // asd();
    //console.log(a);
    //res.send('ok');
});

app.post('/redirect', function(req, res){
    console.log(req.body);
    //console.log(req.cookies.cookieName);

    //console.log(res.headers);
    
    res.send('ok');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
    app.get('/test', function(req, res){
        
        
        console.log('GETtest, ok');
        console.log('req',req);
        console.log('query' ,req.query);
        console.log('params',req.params);
        console.log('body',req.body);
    //console.log(req.cookies.cookieName);

    //console.log(res.headers);
    
    res.send('okk');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
app.get('/appSecretTest', function(req, res){
    var link=x.createAppSecret();
    console.log('link secret',link);
     request(link, function (error, response, body) {
    if(error){console.log('some problems with req fb');}
        console.log('body',body); // Show the HTML for the Modulus homepage.
        });
    //    console.log('GETtest, ok');
    //    console.log('req',req);
    //    console.log('query' ,req.query);
      //  console.log('params',req.params);
    //    console.log('body',req.body);
    //console.log(req.cookies.cookieName);

    //console.log(res.headers);
    
    res.send('okk');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
app.get('/testLogin', function(req, resp){
    z=0
    var login=x.loginLink()
    
    resp.redirect(login);
    //console.log('hi');
    //var a=new setDate();
    //a.todayIs();
    //console.log(a.dispalyTime());
    //getDateFromGcall();
    // getCookie();
    //a.getGPIDandGSH()
    //console.log(a.z);
    //console.log(a.params);
    //asd();
    //resp.send('ok');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
//hi 7594161 6a5e61df [ 'PHPSESSID=856sgp5ehj7to5f6khsme58pc4; path=/' ]

setInterval(function () { 
    var updateTime=[];
    time.todayIs();
    updateTime[0]=time.displayTime();
    time.tommorowIs()
    updateTime[1]=time.displayTime();
    for(var i=0;i<updateTime.length;i++){
        myFunc.subs(updateTime[i],function(y){
            
            console.log(y);
        })
        
    }
    
    console.log('second passed'); 
}, 1000*60*6);
/*
setTimeout(function () { 
    var updateTime=[];
    time.todayIs();
    updateTime[0]=time.displayTime();
    time.tommorowIs()
    updateTime[1]=time.displayTime();
    for(var i=0;i<updateTime.length;i++){
        myFunc.subs(updateTime[i],function(y){
            
            console.log(y);
        })
        
    }
    
    console.log('second passed'); 
}, 1000);
*/
https.createServer(opts, app).listen(8088);
console.log('Started');
//app.listen(8090);
// some places where save
//place /zso11
//colections users
//login, password, data
// substitutions
/*
myFunc.subs('2016-10-07',function(y){
    //console.log(y);
   // y[]
    var a=JSON.stringify(y);
    console.log(a);

})
*/
//myFunc.getCookie(function(){});//mongoTest();

app.get('/redirect_codeAcces', function(req, res){
        console.log('codeAcces answer');
    var code=req.query;
    console.log(code);
    
    //res.redirect(x.codeForAcces(code));
    console.log(req.params);
    //console.log(req.cookies.cookieName);

    //console.log(res.headers);
    
    res.send('ok');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
var z=0

app.get('/redirect', function(req, res){
        console.log('redirect');
    if(req.query['code'] !== undefined){
        console.log('this user dialog');
        onDialog(req.query)
    }
    if(req.query['access_token'] !== undefined){
        console.log('this is acces token request');
        onToken(req.query);
    }
    

/*    
    var form= { 
        'client_id':+config.clientId,
         redirect_uri:config.url+'/redirect_codeAcces',
         client_secret:config.appSecret,
         code:code
    }
  */  
    
    /*
    request({
    //rejectUnauthorized: false,
    url: 'https://www.facebook.com/v2.8/dialog/oauth/access_token', //URL to hit
    qs: form, //Query string data
    method: 'GET', //Specify the method
    headers: { //We can define headers too
        'Content-Type': 'MyContentType',
        'Custom-Header': 'Custom Value'
    }
}, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode);
    }
});
*/

    //res.redirect(x.codeForAcces(code));
    //console.log(req.params);
    //console.log(req.cookies.cookieName);

    //console.log(res.headers);
    
    res.send('ok');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
function onDialog(reqBody){
            var code=reqBody['code'];
    console.log(code);
        request(x.codeForAcces(code), function (error, response, body) {
    if(err){console.log('some problems with req fb');}
        console.log('body',body); // Show the HTML for the Modulus homepage.
        });
        
        
    }
    function onToken(reqBody){
        var access=reqBody['access_token'];
        console.log(access);
        
    }


function createReqest (){
   // appSetting.call(this);
    
    this.loginLink=function(){
        var redirect='/redirect';
        return  'https://www.facebook.com/v2.8/dialog/oauth?'+'client_id='+config.clientId+'&redirect_uri='+config.url+redirect;
        /*
        
        https://www.facebook.com/v2.8/dialog/oauth?
        client_id={app-id}
        &redirect_uri={redirect-uri}
        
        */
    }
    this.codeForAcces=function(code){
        var redirect='/redirectt';
        return 'https://graph.facebook.com/v2.8/oauth/access_token?'+ 'client_id='+config.clientId+'&redirect_uri='+config.url+redirect+'&client_secret='+config.appSecret+'&code='+code;
        
       /*
       
           GET https://graph.facebook.com/v2.8/oauth/access_token?
       client_id={app-id}
       &redirect_uri={redirect-uri}
       &client_secret={app-secret}
       &code={code-parameter}
       
       */
    }
    this.createAppSecret=function(){
        return 'https://graph.facebook.com/v2.8/oauth/access_token?client_id='+config.clientId+'&client_secret='+config.appSecret+'&grant_type=client_credentials';
        
        /*
        
        https://graph.facebook.com/v2.8/oauth/access_token
        ?client_id={app-id}
        &client_secret={app-secret}
        &grant_type=client_credentials
        
        */
    }
}



function mongoTest(){
        MongoClient.connect('mongodb://localhost:27017/test2', function(err, db) {

    var collection = db.collection('substitutions');

        db.collections(function(err, collections){
         // console.log(collections);
      }); 
        collection.find({_id:'2016-10-06'}).forEach(function(f){console.log(f)});
            //collection.update({_id:'2016-10-04'}, {$set:{substitution:'hey'}},{upsert:true});
        collection.find({},{}).forEach(function(f){
            //console.log(f)
        });
          db.close();
    });

}
