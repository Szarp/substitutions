var express = require('express'),
	fs= require('fs'),
	https =require('spdy'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	compression = require('compression'),
	helmet = require('helmet'),
	crypto = require("crypto"),
	mangeUsers = require(__dirname+'/myModules/manageUsers.js'),
	session = require(__dirname + '/myModules/userSession.js'),
	link = require(__dirname+'/myModules/fbLinks.js'),
	config = require(__dirname+'/myModules/config'),
	webhook = require(__dirname+'/myModules/moduleSwitch.js'),
	download = require(__dirname+'/myModules/downloadChanges.js');

var app = express();
var cookie = new session.sessionCreator();
var sessionList = {};
//set up certificates for HTTPS
var opts = {
	// Specify the key file for the server
	key: fs.readFileSync('cert/wsskey.pem'),
	// Specify the certificate file
	cert: fs.readFileSync('cert/wsscert.pem'),
	// Specify the Certificate Authority certificate
	ca: fs.readFileSync('cert/cacert.pem'),
};
//set up express app
app.use(express.static(__dirname + '/public'));
app.post("/webhook", bodyParser.json({ verify: verifyRequestSignature })); // Webhook request verification
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // for parsing
app.use(cookieParser());
app.use(compression()); //use gzip compression
//app.use(helmet()); //Set http headers to protect from eg. clickjacking
app.use(helmet({
	hsts: {
		maxAge: 31536000,
		// Must be enabled to be approved by Google for HSTS preload
		includeSubDomains: true,
		preload: true
	}
}));

//setting cookie on first login
app.use(function (req, res, next) {
    var disabled=['/webhook','/dataflow','/login'];
    if (disabled.indexOf(req.path) != -1)
        return next();
    //check if client sent cookie
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
});
app.get('/', function (req, res){
    res.sendFile( __dirname + '/public/substitutionPage.htm');
});
app.get('/index', function (req, res) {
    res.sendFile( __dirname + '/public/substitutionPage.htm');
});
app.get('/demo/:id', function (req, res) {
    res.setHeader("X-Frame-Options", "ALLOW-FROM https://www.messenger.com/");
    res.setHeader("X-Frame-Options", "ALLOW-FROM https://www.facebook.com/");
    res.sendFile(__dirname + '/demo/' + req.params.id);
});
app.post('/login', function (req, res) {
   console.log('Asking for login');
    var login=link.loginAttempt('');
    //check cookie or something
    console.log(login);
    res.redirect(login);
});
app.get('/webhook', function(req, res) {
	if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.webhookToken) {
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
});
app.post('/webhook', function (req, res) {
var data = req.body;
if (data.object === 'page') {
	// Iterate over each entry - there may be multiple if batched
if(data.entry){
	data.entry.forEach(function(entry) {
		var pageID = entry.id;
		var timeOfEvent = entry.time;
        var messParams={
            message:false,
            postback:false,
            payload:false,
            attachments:false,
            text:false,
            delivery:false,
            echo:false,
            read:false
        };
		entry.messaging.forEach(function(event) {
            if(event.message){
                messParams["message"]=true;
                //webhook.message(event);
                if(event.message["attachments"])
                    messParams["attachments"]=true;
                if(event.message["is_echo"])
                messParams["echo"]=true;
                if(event.message["text"])
                    messParams["text"]=true;
            }
            if(event.postback){
                messParams["message"]=true;
                if(event.postback["payload"])
                    messParams["payload"]=true;
            }
            if(event.read)
                messParams["read"]=true;
            if(event.delivery)
                    messParams["delivery"]=true;

            webhook.messageLogistic(messParams,event);
		});
	});
}
	//send 200 within 20s to inform Facebook that message was received successfully
	res.sendStatus(200);
	}
});
app.post('/postCall',function(req,res){
    var reqCookie=req.cookies.cookieName;
    var userId=cookie.findIfSessionExist(reqCookie);
    console.log('user session: ',userId);
    console.log('Mode: '+req.body['mode']);
    console.log('user session: ',userId);
	mangeUsers.postCall(userId,req.body,function(resText){
		if(userId == '0000' && req.body['mode'] == 'getSettings'){
			res.send(JSON.stringify({err:true,message:"Please log in using your Facebook account",params:resText}));
		}
		else{
			res.send(JSON.stringify({err:false,message:"",params:resText}));
		}
	})
})
app.get('/redirect', function(req, res){
	var reqCookie=req.cookies.cookieName;
	console.log('redirect');
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
	console.log('deredirect');
	console.log('deredirect',req.body);
});
//Dynamically generate iframe with Send To Messenger button
app.get('/STMbtn', function(req, res){ //respond to GET request on /STMbtn
	var reqCookie = req.cookies.cookieName;  //get session cookie (named "cookieName")
	var userId = cookie.findIfSessionExist(reqCookie); //get user id assigned to session cookie
	if(userId == '0000'){ //send "please log in" message if user is not logged in
		res.send(`<a href="login" target="_blank" rel="noopener" style="text-align: center;text-decoration: underline;color: black;"><div style="margin: auto; width: 100%; text-align:center;background-color: whitesmoke;border: solid;border-width: 1px;border-radius: 5px;">Please log in to enable Messenger notifications</div></a>`);
	} else { //if user is logged in send "Send To Messenger" button with his id as param
		console.log("Loading Send To Messenger button for user with id", userId);
		var ifrTS = `<div class="fb-send-to-messenger" color="blue" size="xlarge" messenger_app_id="` + config.clientId + `" data-ref="` + userId + `" page_id="` + config.pageId + `"></div>
		<script id="fbButtonScript">
		function callFB(){
			window.fbAsyncInit = function() {
				FB.init({
					appId            : '` + config.clientId + `',
					autoLogAppEvents : true,
					xfbml            : true,
					version          : 'v2.12'
				});
			};
			(function(d, s, id){
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) {return;}
				js = d.createElement(s); js.id = id;
				js.src = "https://connect.facebook.net/en_US/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		}
		callFB();
		</script>`;
		res.send(ifrTS);
	}
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 * Using code from: https://github.com/fbsamples/messenger-platform-samples/blob/724abbde42a63dedac65f67bf7a828cfcd1a8ca6/node/app.js#L153
 *
 */
function verifyRequestSignature(req, res, buf) {
	let signature = req.headers["x-hub-signature"];

	if (!signature) {
		throw new Error("Couldn't validate the signature. No \"x-hub-signature\" header.");
	} else {
		let elements = signature.split("=");
		let signatureHash = elements[1];
		let expectedHash = crypto.createHmac("sha1", config.appSecret)
			.update(buf)
			.digest("hex");

		if (signatureHash != expectedHash) {
			throw new Error("Couldn't validate the request signature. Signatures don't match");
		}
	}
}

//Timers
setInterval(function(){
    download.all();
}, 1000*60*10); //now running once per 10 minutes

setTimeout(function () {
    download.all();
}, 1000); //download substitutions 1 second after start

setTimeout(function(){
	cookie.deleteOld();
},1000*60*60*24*30); //remove cookies (session) after 30 days

https.createServer(opts, app).listen(8088);
console.log('Started port 8088');
