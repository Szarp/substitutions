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
    mongo=require(__dirname+'/myModules/mongoFunctions.js');
    setTime = require(__dirname+'/myModules/setTime.js');
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

var opts = {
   
  // Specify the key file for the server
  key: fs.readFileSync('/Users/bartek/Documents/2016/wsskey.pem'),
   
  // Specify the certificate file
  cert: fs.readFileSync('/Users/bartek/Documents/2016/wsscert.pem'),
   
  // Specify the Certificate Authority certificate
  ca: fs.readFileSync('/Users/bartek/Documents/2016/cacert.pem'),
   
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
app.get('/test', function (req, res) {
    //var a=userMod.changes();
    //us.changes();
   // asd();
    //console.log(a);
    res.send('ok');
});
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
    app.get('/redirect', function(req, res){
        console.log('i get response, ok');
    console.log('query' ,req.query);
    console.log(req.params);
    //console.log(req.cookies.cookieName);

    //console.log(res.headers);
    
    res.send('ok');
	//es.sendFile( __dirname + '/public/css/webPage.css');

});
app.get('/testSetCookie', function(req, resp){
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
    resp.send('ok');
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
console.log('hi im alive');
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
var exData =[
    {"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["1"],"subjects":["angielski"],"teachers":["Ceglinska"],"classes":["2b"],"classrooms":["5"],"groupnames":["2. Grupa"],"periodorbreak":["00P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Ogrocka"],"subjects":["historia 5"]},"type":["card"],"periods":["3"],"subjects":["polski 5"],"teachers":["Stankowska"],"classes":["2a","2b","2c","2d"],"classrooms":["31"],"groupnames":["seminargroup:4"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za III GD"],"note":[""],"changes":{"teachers":["Achtelik"],"subjects":["g.wych"]},"type":["card"],"periods":["3"],"subjects":["wos"],"teachers":["Antonowicz"],"classes":["2gd"],"classrooms":["13"],"groupnames":[""],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["łączone"],"note":[""],"changes":{"teachers":["Taca Andrzej"]},"type":["card"],"periods":["4"],"subjects":["wf"],"teachers":["Głodny Szymon"],"classes":["1gc"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Ogrocka"]},"type":["card"],"periods":["4"],"subjects":["sih 3"],"teachers":["Glombik"],"classes":["2a","2d"],"classrooms":["5"],"groupnames":["seminargroup:3"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Jałowiecki"],"subjects":["matematyka"]},"type":["card"],"periods":["4"],"subjects":["biologia 4"],"teachers":["Kucharz"],"classes":["2b","2c"],"classrooms":["10"],"groupnames":["seminargroup:4"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Kruszelnicka"]},"type":["card"],"periods":["4"],"subjects":["angielski"],"teachers":["Pilch"],"classes":["3d"],"classrooms":["33"],"groupnames":["1. Grupa"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Pordzik"],"subjects":["g.wych"]},"type":["card"],"periods":["5"],"subjects":["polski"],"teachers":["Stankowska"],"classes":["1c"],"classrooms":["31"],"groupnames":[""],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["łączone"],"note":[""],"changes":{"teachers":["Taca Andrzej"]},"type":["card"],"periods":["5"],"subjects":["wf"],"teachers":["Głodny Szymon"],"classes":["1gc"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Skoczylas Ewa"],"subjects":["niemiecki"]},"type":["card"],"periods":["5"],"subjects":["sih 8"],"teachers":["Glombik"],"classes":["2a","2b","2c","2d"],"classrooms":["32"],"groupnames":["seminargroup:1"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Wiencierz"],"subjects":["matematyka"]},"type":["card"],"periods":["5"],"subjects":["przyroda 5"],"teachers":["Kucharz"],"classes":["2a","2b","2c","2d"],"classrooms":["10"],"groupnames":["seminargroup:4"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["łączone"],"note":[""],"changes":{"teachers":["Mazur Iza"]},"type":["card"],"periods":["2"],"subjects":["wf"],"teachers":["Głodny Szymon"],"classes":["1b"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Marian Aleksandra"],"subjects":["chemia 3"]},"type":["card"],"periods":["5"],"subjects":["biologia 3"],"teachers":["Antonowicz"],"classes":["2a","2d"],"classrooms":["22"],"groupnames":["seminargroup:5"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Wlisłocka Małgorzata"],"subjects":["matematyka"]},"type":["card"],"periods":["5"],"subjects":["angielski"],"teachers":["Ceglinska"],"classes":["3a"],"classrooms":["5"],"groupnames":["1. Grupa"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za III GD"],"note":[""],"changes":{"teachers":["Kaczmar"],"subjects":["niemiecki"]},"type":["card"],"periods":["5"],"subjects":["polski"],"teachers":["Żmuda Paweł"],"classes":["3d"],"classrooms":["3"],"groupnames":[""],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Pordzik"],"subjects":["francuski"]},"type":["card"],"periods":["6"],"subjects":["angielski"],"teachers":["Ceglinska"],"classes":["1a","1c"],"classrooms":["5"],"groupnames":["seminargroup:2"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Niezgoda"],"subjects":["niemiecki"]},"type":["card"],"periods":["6"],"subjects":["angielski"],"teachers":["Pilch"],"classes":["1a","1c"],"classrooms":["19"],"groupnames":["seminargroup:4"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Adam"],"subjects":["chemia"]},"type":["card"],"periods":["6"],"subjects":["biologia"],"teachers":["Kucharz"],"classes":["1d"],"classrooms":["10"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Cwołek"],"subjects":["matematyka"]},"type":["card"],"periods":["6"],"subjects":["polski"],"teachers":["Żmuda Paweł"],"classes":["2a"],"classrooms":["3"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Jałowiecki"],"subjects":["matematyka"]},"type":["card"],"periods":["6"],"subjects":["g.wych"],"teachers":["Stankowska"],"classes":["2c"],"classrooms":["31"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za 9 lekcję"],"note":[""],"changes":{"teachers":["Burnus"],"subjects":["religia"],"classrooms":["14"]},"type":["card"],"periods":["6"],"subjects":["biologia"],"teachers":["Antonowicz"],"classes":["2gb"],"classrooms":["28"],"groupnames":[""],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Wróbel"],"subjects":["informatyka"],"classrooms":["37"]},"type":["card"],"periods":["7"],"subjects":["historia"],"teachers":["Glombik"],"classes":["1d"],"classrooms":["10"],"groupnames":["2. Grupa"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["biologia"],"teachers":["Antonowicz"],"classes":["1gb"],"classrooms":["3"],"groupnames":["1. Grupa"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[false],"substitution_types":["łączone"],"note":[""],"changes":{"teachers":["Lee"],"classrooms":["5"]},"type":["card"],"periods":["7"],"subjects":["angielski"],"teachers":["Pilch"],"classes":["2gb"],"classrooms":["19"],"groupnames":["2. Grupa"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["angielski"],"teachers":["Ceglinska"],"classes":["3ga"],"classrooms":["5"],"groupnames":["2. Grupa"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["historia"],"teachers":["Glombik"],"classes":["1d"],"classrooms":["10"],"groupnames":["1. Grupa"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["angielski"],"teachers":["Ceglinska"],"classes":["3b"],"classrooms":["5"],"groupnames":["1. Grupa"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Kruszelnicka"]},"type":["card"],"periods":["8"],"subjects":["angielski"],"teachers":["Pilch"],"classes":["3c"],"classrooms":["49"],"groupnames":["2. Grupa"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["wf"],"teachers":["Głodny Szymon"],"classes":["3gc"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["9"],"subjects":["wf"],"teachers":["Głodny Szymon"],"classes":["3gc"],"classrooms":["0gim"],"groupnames":["Dziewczęta"],"periodorbreak":["08P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Zajdel"],"classes":["3gd"],"classrooms":["32"],"periodorbreak":["03P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["8"],"subjects":["matematyka"],"teachers":["Drohojowski"],"classes":["3gd"],"classrooms":["4"],"periodorbreak":["07P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["7"],"subjects":["religia"],"teachers":["Burnus"],"classes":["3gd"],"classrooms":["14"],"periodorbreak":["06P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["biologia"],"teachers":["Kucharz"],"classes":["1gd"],"classrooms":["10"],"groupnames":["2. Grupa"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["6"],"subjects":["religia"],"teachers":["Burnus"],"classes":["3gd"],"classrooms":["14"],"periodorbreak":["05P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["4"],"subjects":["niemiecki"],"teachers":["Kaczmar"],"classes":["3gd"],"classrooms":["7"],"periodorbreak":["03P"],"moje":[false]},
    {"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["zajęcia techniczne"],"teachers":["Achtelik"],"classes":["3gd"],"classrooms":["34"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"changes":{},"type":["card"],"periods":["5"],"subjects":["zaj art"],"teachers":["Kupiec"],"classes":["3gc","3gd"],"classrooms":["42"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[false],"changes":{},"type":["card"],"periods":["5"],"subjects":["zaj art"],"teachers":["Warzecha"],"classes":["3gc","3gd"],"classrooms":["47"],"periodorbreak":["04P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["niemiecki"],"teachers":["Kaczmar"],"classes":["3gd"],"classrooms":["7"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[true],"substitution_types":[""],"type":["card"],"periods":["2"],"subjects":["polski"],"teachers":["Stankowska"],"classes":["3gd"],"classrooms":["31"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[false],"substitution_types":["łączone"],"note":[""],"changes":{"teachers":["Aureliusz Wieczorek"],"classrooms":["10"]},"type":["card"],"periods":["2"],"subjects":["angielski"],"teachers":["Ceglinska"],"classes":["2b"],"classrooms":["5"],"groupnames":["1. Grupa"],"periodorbreak":["01P"],"moje":[false]},{"cancelled":[true],"note":[""],"substitution_types":[""],"type":["card"],"periods":["3"],"subjects":["polski"],"teachers":["Żmuda Paweł"],"classes":["1d"],"classrooms":["36"],"groupnames":[""],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["płatne"],"note":[""],"changes":{"teachers":["Błaszczykowska"],"subjects":["biologia"],"classrooms":["33"]},"type":["card"],"periods":["3"],"subjects":["angielski"],"teachers":["Ceglinska"],"classes":["1ga"],"classrooms":["5"],"groupnames":["1. Grupa"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["łączone"],"note":[""],"changes":{"teachers":["Błaszczykowska"],"subjects":["biologia"]},"type":["card"],"periods":["3"],"subjects":["angielski"],"teachers":["Pilch"],"classes":["1ga"],"classrooms":["33"],"groupnames":["2. Grupa"],"periodorbreak":["02P"],"moje":[false]},{"cancelled":[false],"substitution_types":["za III GD"],"note":[""],"changes":{"teachers":["Kaczmar"],"subjects":["niemiecki"],"classrooms":["7"]},"type":["card"],"periods":["3"],"subjects":["biologia"],"teachers":["Kucharz"],"classes":["1gd"],"classrooms":["10"],"groupnames":["1. Grupa"],"periodorbreak":["02P"],"moje":[false]}]

        
        
        
    


   










