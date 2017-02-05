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
    facebook = require(__dirname+'/myModules/facebookComunication.js'),
    mangeUsers = require(__dirname+'/myModules/manageUsers.js'),
    session = require(__dirname + '/myModules/userSession.js'),
    link = require(__dirname+'/myModules/fbLinks.js');
    config = require(__dirname+'/myModules/config');
   // querystring = require('querystring');
//var substitution = new jsonFromHtml();
//var user= new userMod();
var app = express();
var cookie = new session.sessionCreator();

//var app = express();
var token = 'EAAPYvxuxXsIBADMMhltBqlarAi5b8ozH5lxHp72JN9ZCZADabTWNgZCGY1OiEbQ4eXTUQYlMOEBJOZAueoaNQaa5Ani5hLOO35PlAiTn94ZBKsZAEl5xqZAtrA2UUesSJ6WBeFypFdPvoERnopjnx9I1FG46jdkZBeAFZCINRXRN7GwZDZD';

//ace:pre;");ASC.createText(gi636490,"Czw\n01.12.");$j(gi636490).click(gi635341);var gi63773

//var link=new facebook.links();
/*
message

{"object":"page","entry":[{"id":"573446562859405","time":1480523515564,"messaging":[{"sender":{"id":"1345064578871981"},"recipient":{"id":"573446562859405"},"timestamp":1480523515364,"message":{"mid":"mid.1480523515364:af9ac5b647","seq":26,"text":"ds"}}]}]}

{"object":"page","entry":[{"id":"573446562859405","time":1480523599033,"messaging":[{"sender":{"id":"1345064578871981"},"recipient":{"id":"573446562859405"},"timestamp":1480523598950,"message":{"mid":"mid.1480523598950:4d3cf19c71","seq":27,"text":"sd"}}]}]}

*/


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


//setting cookie on first login
app.use(function (req, res, next) {
  // check if client sent cookie
    var cookie = req.cookies.cookieName;
    if (cookie === undefined){
        // no: set a new cookie
        var randomNumber=Math.random().toString();
        randomNumber=randomNumber.substring(2,randomNumber.length);
        res.cookie('cookieName',randomNumber, { maxAge: 1000*60*120, httpOnly: false });
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
          receivedMessage(event);
		} else if (event.postback) {
          receivedPostback(event);
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

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.7/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

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
app.get('/test', function(req, res){
	facebook.personalData(token,'name',function(q){
		console.log(q);   
	});
    res.send('okk');
});
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
            console.log('downloaded changes');        
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
 },1000*60*60*3);





https.createServer(opts, app).listen(8089);
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
