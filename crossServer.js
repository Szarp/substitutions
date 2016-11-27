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
        //request= require('request'),
    MongoClient = require('mongodb').MongoClient,
    //assert = require('assert'),
    mongo=require(__dirname+'/myModules/mongoFunctions.js'),
    setTime = require(__dirname+'/myModules/setTime.js'),
    facebook = require(__dirname+'/myModules/facebookComunication.js'),
    mangeUsers = require(__dirname+'/myModules/manageUsers.js'),
    session = require(__dirname + '/myModules/userSession.js'),
    link = require(__dirname+'/myModules/fbLinks.js');
    //config = require(__dirname+'/myModules/config');
   // querystring = require('querystring');
//var substitution = new jsonFromHtml();
//var user= new userMod();
var app = express();
var cookie = new session.sessionCreator();

//var app = express();

//var link=new facebook.links();

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


app.get('/', function (req, res) {
    console.log('Asking for login');
    var login=link.loginAttempt('');
    //check cookie or something
    console.log(login);
    res.redirect(login);
    // asf();
    //res.sendFile( __dirname + '/public/substitutionPage.htm');
    
});
app.get('/index', function (req, res) {
    res.sendFile( __dirname + '/public/substitutionPage.htm');
    
});

app.post('/', function (req, res) {
   console.log('Asking for login');
    var login=link.loginAttempt('');
    //check cookie or something
    console.log(login);
    res.redirect(login);
});

app.post('/postCall',function(req,res){
    var reqCookie=req.cookies.cookieName;
    var userId=cookie.findIfSessionExist(reqCookie);
    console.log('user session: ',userId);
    //console.log('seesionList: ',sessionList);
    console.log('Mode: '+req.body['mode']);
    if(userId == undefined){userId="0000";}
    console.log('user session: ',userId);
        mangeUsers.postCall(userId,req.body,function(resText){
            //console.log('resText',resText);
            res.send(resText);
        })
  
})
app.get('/test', function(req, res){

facebook.personalData(token,function(q){
    console.log(q);
    
})
//        facebook.createNotification(idd,token,function(z){
  //          console.log(z);
    //    })
       //console.log(req.cookies.cookieName);

    //console.log(res.headers);
    
    res.send('okk');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
//facebook.savePerson('0000','token',function(){})
app.get('/redirect', function(req, res){
    //res.redirect('/index');
        var reqCookie=req.cookies.cookieName;
        console.log('redirect');
     //var reqCookie=req.cookies.cookieName;
    mangeUsers.redirect(req,function(id){
        if(id == undefined){id="0000";}
            cookie.addNewSession(id,reqCookie);
        res.redirect('/index');
        
    })
    
   
});
setInterval(function () { 
    var updateTime=[];
    time.todayIs();
    updateTime[0]=time.displayTime();
    time.tommorowIs();
    updateTime[1]=time.displayTime();
    for(var i=0;i<updateTime.length;i++){
        myFunc.subs(updateTime[i],function(y){
            
            console.log(y);
        })
        
    }
    
    console.log('second passed'); 
}, 1000*60*60*6);

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


cookie.addNewSession('abc','cdf');
//cookie.addNewSession('cd','sada');
//cookie.addNewSession('cdds','sadaaa');
//console.log(sessionList)

setTimeout(function(){
    
cookie.deleteOld();    
},1000*60*60*3);





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

//mongoTest();

function mongoTest(){
        MongoClient.connect('mongodb://localhost:27017/test2', function(err, db) {

    var collection = db.collection('testCollection');
           db.collections(function(err, collections){
      console.log(collections);
                    //    db.close();
  });

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
