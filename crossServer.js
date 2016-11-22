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
    link = require(__dirname+'/myModules/fbLinks.js');
    //config = require(__dirname+'/myModules/config');
   // querystring = require('querystring');
//var substitution = new jsonFromHtml();
//var user= new userMod();
var app = express();

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

app.post('/', function (req, res) {
    console.log(req.body);
    res.sendFile( __dirname + '/public/fbIndex.html');
    //var a=userMod.changes();
    //us.changes();
    // asd();    
    //console.log(a);
    //res.send('ok');
});
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
        }
    },
    events:['homePage','substitutionList','settingsMenu'],
    formValues:['1b','yes']
    
}
app.post('/postCall',function(req,res){
    var reqCookie=req.cookies.cookieName;
    var userId=cookie.findIfSessionExist(reqCookie);    
    console.log('Mode: '+req.body['mode']);
    mangeUsers.postCall(userId,req.body,function(resText){
        console.log('resText',resText);
        res.send(resText);
    })
    /*
    var body=req.body;
    
        if(body.mode=='getSettings'){
             console.log('response Settings')
        res.send(JSON.stringify(settings1));    
        }
        if(body.mode=='getChanges'){
                console.log('response Changes')
            if(req.body['param']=='today'){
                time.todayIs();
            }
            else{
                time.tommorowIs();
            }
            console.log(time.displayTime());
            mongo.findById(time.displayTime(),'substitutions',function(obj){
            res.send(JSON.stringify(obj['substitution'])); 
            });
        }        
        if(body.mode=='message'){
            console.log('message')
            
            
        }
        if(body.mode=='saveSettings'){
            var form={};
            form['setClass'] = body.setClass;
            form['notification'] = body.notification;
            console.log('saving chnges to: '+JSON.stringify(form));
            //save with id
            res.send('ok');
            
        }
    */
    

    //console.log('time',getChangesToSend);

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
facebook.savePerson('0000','token',function(){})
app.get('/redirect', function(req, res){
    res.sendFile( __dirname + '/public/substitutionPage.htm');
        console.log('redirect');
     var reqCookie=req.cookies.cookieName;
    //res.sendFile( __dirname + '/public/substitutionPage.htm');
    if(req.query['code'] !== undefined){
        console.log('this user dialog');
        //console
        facebook.createPersonToken(req.query['code'],function(token){
            facebook.getInfoOfToken(token,function(returnData){
                var id=returnData['data'].user_id;
                cookie.addNewSession(id,reqCookie);
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
}, 1000*60*60*6);


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
//*/

var cookie = new sessionCreator();
cookie.addNewSession('abc','cdf');
cookie.addNewSession('cd','sada');
cookie.addNewSession('cdds','sadaaa');
console.log(sessionList)

setTimeout(function(){
    
cookie.deleteOld();    
},4*1000);


function sessionCreator(){
    this.sessionId='sessionList';
    
    this.findIfSessionExist=function(cookie){
        var obj = this.getSessionElement();
        for(var i=0;i<obj.length;i++){
            if(obj[i].cookie == cookie){
                return obj[i].id;
            }
        }
        return '0000';
    }
    this.addNewSession=function(id,cookie){
        //var list = this.getSessionElement();
        var sessionEl = new session(id,cookie);
        var newElement = sessionEl.returnParams();
        sessionList[newElement[0]]=newElement[1];
        console.log(sessionEl.returnParams());
        
        
    }
    this.getSessionElement=function(){
        return sessionList;
    }
    this.deleteOld = function(){
        var time = new Date().getTime();
        //console.log('time: ',time);
        for(k in sessionList){
            if(sessionList[k].exTime < time){
                //console.log('deleting: ',sessionList[k]);
                delete sessionList[k];
            }
        }
        //console.log('actualList',sessionList);
    }
    
}

function session(id,cookie){
    this.cookie = cookie;
    this.id = id;
    this.expirationTime = '';
    
    this.returnParams=function(){
        this.expirationTime=this.setExTime();
        var obj = []
        obj[0] = this.cookie 
        obj[1] = {id:this.id,
                exTime:this.expirationTime}
        return obj; 
            
        
    }
    this.setExTime=function(){
        var time = new Date()
        return time.getTime()+1000*60*60*2;
        
    }
    
    
}


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
