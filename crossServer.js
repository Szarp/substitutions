var express = require('express'),
    fs= require('fs'),
    https =require('https'),
    //querystring = require('querystring'),
    //http = require('http'),
    //userMod = require(__dirname +'/myModules/getSubstitution.js'),
   // jsonFromHtml = require(__dirname +'/myModules/getJsonFromHtml.js'),
    //setDate = require(__dirname +'/myModules/setDate.js'),
    myFunc = require(__dirname+'/myModules/serverReqests.js'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
        //request= require('request'),
    //MongoClient = require('mongodb').MongoClient,
    //assert = require('assert'),
    mongo=require(__dirname+'/myModules/mongoFunctions.js'),
    setTime = require(__dirname+'/myModules/setTime.js'),
    facebook = require(__dirname+'/myModules/facebookComunication.js'),
    link = require(__dirname+'/myModules/fbLinks.js');
    //config = require(__dirname+'/myModules/config');
   // querystring = require('querystring');
//var substitution = new jsonFromHtml();
//var user= new userMod();
var app = express();

//var app = express();

//var link=new facebook.links();

//appSetting();
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
/*

//setting cookie on first login
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

*/
app.get('/', function (req, res) {
    console.log('Asking for login');
    var login=link.loginAttempt();
    //check cookie or something
    //res.redirect(login);
    // asf();
    res.sendFile( __dirname + '/public/substitutionPage.htm');
    
});

app.post('/', function (req, res) {
    console.log(req.body);
    res.sendFile( __dirname + '/public/fbIndex.html');
    //var a=userMod.changes();
    //us.changes();
    // asd();    
    //console.log(a);
    //res.send('ok');
});
app.post('/getChanges',function(req,res){
    console.log('asking for changes for '+req.body['mode']);
    //console.log(req.body);
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
})
app.post('/settings',function(req,res){
    //console.log('asking for changes for '+req.body['mode']);
    //console.log(req.body);
    var settings1 = {
    fields:{
        cancelled:'typ',
        note:'komentarz',
        periods:'lekcja',
        subjects:'przedmiot',
        teachers:'nauczyciel',
        classes:'klasa',
        classrooms:'sala',
        groupnames:'grupa',
        changes:'zmiany',
        substitution_types:'rodzaj'  
    },
    event:{
        changeDisplayEvents :{
            'home':['navbar_home','homePage'],
            'substitution':['navbar_substitution','substitutionList'],
            'settings':['navbar_settings','settingsMenu']
        },
        btnEvents :{
            saveBtn:function(){takeValuesFromForm()},
            tommorowBtn:function(){requestForChanges('tommorow')},
            todayBtn:function(){requestForChanges('today')},
            chooseBtn:''
        }
    },
    events:['homePage','substitutionList','settingsMenu'],
    formValues:['1b','yes']
    
}
    res.send(JSON.stringify(settings1));
  //  mongo.findById(getChangesToSend,'substitutions',function(obj){
    //   res.send(JSON.stringify(obj['substitution'])); 
    //});
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
app.get('/redirect', function(req, res){
        console.log('redirect');
    res.sendFile( __dirname + '/public/substitutionPage.htm');
    if(req.query['code'] !== undefined){
        console.log('this user dialog');
        //console
        facebook.createPersonToken(req.query['code'],function(token){
            facebook.getInfoOfToken(token,function(returnData){
                var id=returnData['data'].user_id;
                console.log('id: '+id);
                console.log('token: '+token);
                //facebook.saveIdAndToken(id,token,function(){})
                facebook.checkIfLongTokenExist(id,function(comunicat){
                    if(comunicat != 'ok'){
                        facebook.tokenToLongLife(token,function(x){
                            console.log('some long');
                            console.log(x);
                        
                            mongo.modifyById(id,'person',{longToken:x},function(){})    
                            
                        });
                        
                        mongo.findById(id,'person',function(z){
                            console.log(z);
                        })
                    }
                    
                });
                
                //data['user_id']=returnData['data'].user_id;
                //facebook.saveIdAndAccesToken
                
            /*
            {"data":{"app_id":"1082740245094082","application":"Bartek Mazur","expires_at":1484085053,"is_valid":true,"issued_at":1478901053,"scopes":["user_friends","email","public_profile"],"user_id":"869953916469086"}}
            */
                
                
            });
            //console.log(x);
            
        })
    }
    if(req.query['access_token'] !== undefined){
        console.log('this is acces token request');
        onToken(req.query);
    }
    
	//es.sendFile( __dirname + '/public/css/webPage.css');

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
/*
myFunc.subs('2016-10-07',function(y){
    //console.log(y);
   // y[]
    var a=JSON.stringify(y);
    console.log(a);

})
*/
//myFunc.getCookie(function(){});//mongoTest();



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
