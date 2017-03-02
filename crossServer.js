var express = require('express'),
    fs= require('fs'),
    https =require('https'),
    //querystring = require('querystring'),
    //http = require('http'),
    //userMod = require(__dirname +'/myModules/getSubstitution.js'),
   // jsonFromHtml = require(__dirname +'/myModules/getJsonFromHtml.js'),
    //setDate = require(__dirname +'/myModules/setDate.js'),
    myFunc = require(__dirname+'/myModules/zsoServerComunication.js'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    request= require('request'),
    MongoClient = require('mongodb').MongoClient,
    //assert = require('assert'),
    mongo=require(__dirname+'/myModules/mongoFunctions.js'),
    setTime = require(__dirname+'/myModules/setTime.js'),
    //facebook = require(__dirname+'/myModules/facebookComunication.js'),
    mangeUsers = require(__dirname+'/myModules/manageUsers.js'),
    session = require(__dirname + '/myModules/userSession.js'),
    link = require(__dirname+'/myModules/fbLinks.js'),
    config = require(__dirname+'/myModules/config'),
	messenger = require(__dirname+'/myModules/messengerBot.js'),
	compression = require('compression');
   // querystring = require('querystring');
//var substitution = new jsonFromHtml();
//var user= new userMod();
var app = express();
var cookie = new session.sessionCreator();

//var app = express();
var token = config.token;


//appSetting();
var sessionList = {};
var opts = {
   
  // Specify the key file for the server
  key: fs.readFileSync('cert/wsskey.pem'),
   
  // Specify the certificate file
  cert: fs.readFileSync('cert/wsscert.pem'),
   
  // Specify the Certificate Authority certificate
  ca: fs.readFileSync('cert/cacert.pem'),
   
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
app.use(compression());


//setting cookie on first login
app.use(function (req, res, next) {
  // check if client sent cookie
    var cookie = req.cookies.cookieName;
    if (cookie === undefined){
        // no: set a new cookie
        var randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        res.cookie('cookieName',randomNumber, { maxAge: 1000*60*60*24*30, httpOnly: false });
        console.log('cookie created successfully');
    } 
    else{
    // yes, cookie was already present 
        console.log('cookie exists', cookie);
    } 
    next(); // <-- important!
});


app.get('/login', function (req, res) {
    console.log('Asking for login');
    var login=link.loginAttempt('');
    //check cookie or something
    console.log(login);
    res.redirect(login);
    // asf();
    //res.sendFile( __dirname + '/public/substitutionPage.htm');
    
});

app.get('/', function (req, res){
    res.sendFile( __dirname + '/public/substitutionPage.htm');
});

app.get('/index', function (req, res) {
    res.sendFile( __dirname + '/public/substitutionPage.htm');
    
});

app.post('/login', function (req, res) {
   console.log('Asking for login');
    var login=link.loginAttempt('');
    //check cookie or something
    console.log(login);
    res.redirect(login);
});

app.get('/webhook', function(req, res) {
    //console.log('hi',req.query);
  if (req.query['hub.mode'] === 'subscribe' &&
		req.query['hub.verify_token'] === config.webhookToken) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          messenger.receivedMessage(event);
		} else if (event.postback) {
          messenger.receivedPostback(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

app.post('/postCall',function(req,res){
    var reqCookie=req.cookies.cookieName;
    var userId=cookie.findIfSessionExist(reqCookie);
    console.log('user session: ',userId);
    //console.log('seesionList: ',sessionList);
    console.log('Mode: '+req.body['mode']);
    console.log('user session: ',userId);
        mangeUsers.postCall(userId,req.body,function(resText){
            if(userId == '0000' && req.body['mode'] == 'getSettings'){
        //res.status(401);
        //console.error('string');
                res.send(JSON.stringify({err:true,message:"Please log in using your Facebook account",params:resText}));
            }
            else{
            //console.log('resText',resText);
                res.send(JSON.stringify({err:false,message:"",params:resText}));
            }
        })
  
})
/*
app.get('/test', function(req, res){
	facebook.personalData(token,'name',function(q){
		console.log(q);   
	});
    res.send('okk');
});
*/
//facebook.savePerson('0000','token',function(){})
app.get('/redirect', function(req, res){
    //res.redirect('/index');
        var reqCookie=req.cookies.cookieName;
        console.log('redirect');
     //var reqCookie=req.cookies.cookieName;
    console.log('if declined',req.query['error']);
    if(req.query['error']){
        console.log('im here');
        res.redirect('/index');
    }
    else{
        mangeUsers.redirect(req,function(id){
            console.log('idd',id);
            if(id == undefined){
                res.send('Problem logging in. Try again.');
            }
            else{
                cookie.addNewSession(id,reqCookie);
                res.redirect('/index');
            }
        });
    }
    
   
});

app.get('/deredirect', function(req, res){
    //res.redirect('/index');
        //var reqCookie=req.cookies.cookieName;
        console.log('deredirect');
     console.log('deredirect',req.body);    
   
});


setInterval(function(){
    time.tommorowIs();
    myFunc.subs(time.displayTime(),function(y){
        time.todayIs();
        myFunc.subs(time.displayTime(),function(b){
            time.theDayAfterTomorrowIs();
            myFunc.subs(time.displayTime(),function(x){
                console.log('downloaded changes');
            });
        });               
    });
}, 1000*60*60*1); //now running once per hour

  //  myFunc.subs(time.displayTime(),function(y){
    //        });
///*
 setTimeout(function () { 
     time.tommorowIs();
     myFunc.subs(time.displayTime(),function(y){
         time.todayIs();
         myFunc.subs(time.displayTime(),function(b){
             console.log('downloaded changes');        
         });                 
     });
 }, 1000);
//*/


//cookie.addNewSession('abc','cdf');
//cookie.addNewSession('cd','sada');
//cookie.addNewSession('cdds','sadaaa');
//console.log(sessionList)

 setTimeout(function(){
     cookie.deleteOld();    
 },1000*60*60*24*30);





https.createServer(opts, app).listen(8088);
console.log('Started');
//app.listen(8090);
/*
myFunc.subs('2016-11-16',function(y){
    //console.log(y);
   // y[]
    var a=JSON.stringify(y);
    console.log(a);

})
*/
//myFunc.getCookie(function(){});//mongoTest();
//mongo.findById('2016-12-05','substitutions',function(err,doc){
    //console.log(err);
//    console.log(JSON.stringify(doc));
//})
//mongoTest();

function mongoTest(){
        MongoClient.connect('mongodb://localhost:27017/test2', function(err, db) {

    var collection = db.collection('substitutions');
   //        db.collections(function(err, collections){
    //  console.log(collections);
                    //    db.close();
//  });

//    mongo.save(["testCollection",{_id:'params',gpid:'',gsh:'',cookie:''}],function(){});
    /*        
db.createCollection("testCollection", function(err, collectiona){
	   if (err) throw err;

	   	console.log("Created testCollection");
	 		console.log(collectiona);
	});
    */
        collection.find({}).forEach(function(f){console.log("hi",f)});
            //collection.update({_id:'2016-10-04'}, {$set:{substitution:'hey'}},{upsert:true});
        //collection.find({},{}).forEach(function(f){
            //console.log(f)
        //});
        //  db.close();
    });

}
