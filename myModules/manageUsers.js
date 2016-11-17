//some USers Module
    var facebook = require('./facebookComunication.js'),
         setTime = require('./setTime.js'),
        mongo = require('./mongoFunctions.js');


var time = new setTime();
function redirect(req,callback){
    console.log('redirect');
     var reqCookie=req.cookies.cookieName; //cookie
        console.log('this user dialog');
        //console
        facebook.createPersonToken(req.query['code'],function(token){
            facebook.getInfoOfToken(token,function(returnData){
                var id=returnData['data'].user_id; //id
                cookie.addNewSession(id,reqCookie);
                console.log('id: '+id);
                console.log('token: '+token);
                //if()
                //mongo.findById(id,)
                facebook.savePerson(id,token,function(){
                    //in the future will get name
                    setImmediate(function() {
                    callback();
                });
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
var pageSettings = {
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
    
    //var reqCookie=req.cookies.cookieName;
    //var userId=cookie.findIfSessionExist(reqCookie);
function postCall(userId,body,callback){

    var res='';
    //console.log('Mode: '+req.body['mode']);
    //var body=req.body;
    
        if(body.mode=='getSettings'){
            facebook.readPersonalSettings(userId,function(params){
                if(params == ''){params={setClass:'all',notification:'no'}}
                var table=[];
                table[0]=params.setClass;
                table[1]=params.notification;
                pageSettings['formValues']=table;
                res = JSON.stringify(pageSettings); 
                setImmediate(function() {
                    callback(res);
                });
                //console.log('response Settings',res);
            })        
        }
        else if(body.mode=='getChanges'){
                console.log('response Changes')
            if(body['param']=='today'){
                time.todayIs();
            }
            else{
                time.tommorowIs();
            }
            console.log(time.displayTime());
            mongo.findById(time.displayTime(),'substitutions',function(err,obj){
                console.log(err,obj);
                res = JSON.stringify(obj['substitution']);
                setImmediate(function() {
                    callback(res);
                });
            });
        }        
        else if(body.mode=='message'){
            
            mongo.save(['messages',{id:userId,message:body.param,time:new Date()}],function(){
                
                res = 'thanks for your message, we will read it soon';
                setImmediate(function() {
                    callback(res);
                });
            }); 
        }
        else if(body.mode=='saveSettings'){
            console.log('saving chnges to: '+JSON.stringify(form));
            var form={};
            form['setClass'] = body.setClass;
            form['notification'] = body.notification;
            
            facebook.savePersonalSettings(userId,form,function(){
                res = 'ok';
                setImmediate(function() {
                    callback(res);
                });
                
            })
            
        }
        else{
            res = 'err'
            setImmediate(function() {
                callback(res);
            });
        };
        console.log('hi',res);

    
}
exports.postCall = postCall;
exports.redirect = redirect;