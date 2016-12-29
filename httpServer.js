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