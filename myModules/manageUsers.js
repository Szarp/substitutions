//some Users Module
    var facebook = require('./facebookComunication.js'),
        //setTime = require('./setTime.js'),
        callFunc = require('./postCallFunctions.js');
        //mongo = require('./mongoFunctions.js');


//var time = new setTime();
function redirect(req,callback){
    //console.log('redirect');
     //var reqCookie=req.cookies.cookieName; //cookie
       // console.log('this user dialog');
        //console
        facebook.createPersonToken(req.query['code'],function(token){
            facebook.getInfoAboutToken(token,function(returnData){
                console.log('return data',returnData);
                var id=returnData['data'].user_id; //id
                //cookie.addNewSession(id,reqCookie);
                console.log('id: '+id);
                console.log('token: '+token);
                //if()
                //mongo.findById(id,)
                console.log('test id',id);    
                facebook.addName(token,function(name){
                    console.log('test name',name);
                    facebook.getPicture(token,function(picture){
                        console.log('test pic',picture);
                        facebook.facebookSavePerson(id,name,picture,function(){
                            
                            setImmediate(function() {
                                callback(id);
                            });
                        })    
                    })
                    //in the future will get name        
                });
                /*
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
                */
                //data['user_id']=returnData['data'].user_id;
                //facebook.saveIdAndAccesToken 
            }); 
        });  
}

var matchingModes ={
    getSettings:{
        name:'getSettings',
        description:"Response personalized settings"
    },
    getChanges:{
        name:'getChanges',
        description:"Response changes for asked day"
    },
    classList:{
        name:'classList',
        description:"Response class list for asked day"
    },
    message:{
        name:'message',
        description:"Saves messegs from participants"
    },
    saveSettings:{
        name:'saveSettings',
        description:"Saves personalized settings"
    },
    picture:{
        name:'picture',
        description:"Response personalized photo"
    },
    generateToken:{
        name:'generateToken',
        description:'Responses token for user'
    
    },
    checkToken:{
        name:'checkToken',
        description:'Responses if there is match for tokens'
    
    }
}
    //var reqCookie=req.cookies.cookieName;
    //var userId=cookie.findIfSessionExist(reqCookie);
function postCall(userId,body,callback){

    var res='';
    if(matchingModes[body.mode] != undefined){
    //console.log('Mode: '+req.body['mode']);
    //var body=req.body;
    
        if(body.mode=='getSettings'){
            callFunc.getSettings(userId,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });        
        }
        else if(body.mode=='getChanges'){
            callFunc.getChanges(body,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });
        }         
        else if(body.mode=='classList'){
            callFunc.classList(body,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });
        }          
        else if(body.mode=='message'){
            callFunc.message(userId,body,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });
        }
        else if(body.mode=='saveSettings'){
            callFunc.saveSettings(userId,body,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });
        }
        else if(body.mode=='picture'){
            callFunc.picture(userId,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });
        }
        else if(body.mode=='generateToken'){
            callFunc.tokenGenerate(userId,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });
        }
        else if(body.mode=='checkToken'){
            callFunc.tokenCheck(userId,body,function(resText){
                setImmediate(function() {
                    callback(resText);
                });
            });
        }
    }
    else {
        res = 'no matches in postCall'
        setImmediate(function() {
            callback(res);
        });
    };
        //console.log('hi',res);

    
}
exports.postCall = postCall;
exports.redirect = redirect;
