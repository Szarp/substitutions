var mongo=require('./mongoFunctions.js');



function matchTokens(collection,token,callback){
    var collectionList={peson:'messengerPerson',messengerPerson:'person':}
    mongo.findByParam({"system.connected":false,"system.secret":token} ,{"system.secret":"1"},collection,function(a){
        if(a.length == 1){
            var person =a.secret;
            var time = new Date().getTime()
            if(person.expirationTime-time>0){
                setImmediate(function(){
		          //console.log(buttons);
		              callback(person._id);
                });
            }
            else{
                setImmediate(function(){
                  //console.log(buttons);
                    callback(null);
                });
            }
        }
        else{
            setImmediate(function(){
              //console.log(buttons);
                callback(null);
            });
        }
    //console.log('hi there');
    //console.log('a',a);
    });
}
function ifMatches(collection,matchingId,callback){
    
    
}

//mongoTest();
var token ={
    secret:'12345',
    expirationTime:'time+2h',
    
}

function compareTokens(pattern,token,callback){
    //var resp = "";
    var time = new Date().getTime();
    if(pattern.secret == token){
        //resp="tok"
        if(pattern.expirationTime < time){
            setImmediate(function(){
		//console.log(buttons);
                callback(true);
            });
        }
    }
    else{
        setImmediate(function(){
		//console.log(buttons);
		  callback(false);
        });
    }
}

function generateSecretToken(callback){
//var pattern = "abcdefghijklmnoprstuwxyz1234567890"; //34 znaki
  //  var hash = 0;
    //for(var i=0;i<5;i++){
        var time = new Date().getTime()+1000*60*24;
        var index = Math.floor(Math.random()*100000);
        //hash+=pattern.charAt(index);
        
    //}
    setImmediate(function(){
		//console.log(buttons);
		callback(index,time);
	});
}
function saveSecretToken(){
    
}