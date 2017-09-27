var express = require('express'),
    mangeUsers = require(__dirname+'/myModules/fakeManageUsers.js'),
    bodyParser = require('body-parser'),
    session = require(__dirname + '/myModules/userSession.js'),
    cookieParser = require('cookie-parser'),
    fs = require('fs');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // for parsing
app.use(cookieParser());

   
var cookie = new session.sessionCreator();
var sessionList = {};
    app.use(function (req, res, next) {
    //check if client sent cookie
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
app.get('/index', function (req, res) {
    res.sendFile( __dirname + '/public/substitutionPage.htm');
    
});

app.get('/STMbtn', function(req, res){ //respond to GET request on /STMbtn
	var reqCookie = req.cookies.cookieName;  //get session cookie (named "cookieName")
	var userId = cookie.findIfSessionExist(reqCookie); //get user id assigned to session cookie
	if(userId == '0000'){
		res.send(`<!DOCTYPE html><html><body><a href="login" target="_blank" rel="noopener" style="text-align: center;text-decoration: underline;color: black;"><div style="margin: auto; width: 100%; text-align:center;background-color: whitesmoke;border: solid;border-width: 1px;border-radius: 5px;">Please log in to enable Messenger notifications</div></a></body></html>`);
	} else {
		console.log("Loading Send To Messenger button for user with id", userId);
		
	}
})
    
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
});

app.listen(3000,function(){
console.log('ok');
})