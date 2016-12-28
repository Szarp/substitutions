//some Users Module
    var facebook = require('./facebookComunication.js'),
         setTime = require('./setTime.js'),
        mongo = require('./mongoFunctions.js');


var time = new setTime();
function redirect(req,callback){
    //console.log('redirect');
     //var reqCookie=req.cookies.cookieName; //cookie
       // console.log('this user dialog');
        //console
        facebook.createPersonToken(req.query['code'],function(token){
            facebook.getInfoAboutToken(token,function(returnData){
                var id=returnData['data'].user_id; //id
                //cookie.addNewSession(id,reqCookie);
                console.log('id: '+id);
                console.log('token: '+token);
                //if()
                //mongo.findById(id,)
                facebook.savePerson(id,token,function(){
                    
                    facebook.addName(id,token,function(){
                        
                        
                    })
                    //in the future will get name
                    setImmediate(function() {
                        callback(id);
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
        //brak:'brak',
        substitution_types:'rodzaj'
    },
    event:{
        changeDisplayEvents :{
            'home':[['navbar_home','navbar_homeD'],'homePage'],
            'substitution':[['navbar_substitution','navbar_substitutionD'],'substitutionList'],
            'about':[['navbar_photo','navbar_photoD'],'about1'],
            'settings':[['navbar_settings','navbar_settingsD'],'settingsMenu']
            
        }
    },
    events:['homePage','substitutionList','settingsMenu','about1'],
    formValues:['all','no']
    
}
    
    //var reqCookie=req.cookies.cookieName;
    //var userId=cookie.findIfSessionExist(reqCookie);
function postCall(userId,body,callback){

    var res='';
    //console.log('Mode: '+req.body['mode']);
    //var body=req.body;
    
        if(body.mode=='getSettings'){
            //console.log(id);
            mongo.findById(userId,'person',function(err,doc){
                if (err){console.log('prolem with settings: ',userId)};
                console.log('Settings file: ',doc);
                var params = (doc['settings']);
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
                //console.log('response Changes')
            if(body['param']=='today'){
                time.todayIs();
            }
            else{
                time.tommorowIs();
            }
            console.log('requested date: ',time.displayTime());
            mongo.findById(time.displayTime(),'substitutions',function(err,obj){
                //console.log(err,obj);
                if(err){console.log('err in sending substitutions')}
                var objToSend={};
                objToSend['substitution']=obj['substitution'];
                if(obj['date'] == undefined){obj['date']='31-12-2016'}
                objToSend['date']=obj['date'];
                res = JSON.stringify(objToSend);
                setImmediate(function() {
                    callback(res);
                });
            });
        }         
        else if(body.mode=='classList'){
                //console.log('response Changes')
            if(body['param']=='today'){
                time.todayIs();
            }
            else{
                time.tommorowIs();
            }
            //console.log('requested date: ',time.displayTime());
            mongo.findById(time.displayTime(),'substitutions',function(err,obj){
                //console.log(err,obj);
                if(err){console.log('err in sending substitutions')}
                res = JSON.stringify(obj['userList']);
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
            if(userId!="0000"){
                console.log('saving chnges to: '+userId);
                var form={};
                form['setClass'] = body.setClass;
                form['notification'] = body.notification;
                 mongo.modifyById(userId,'person',{settings:form},function(){
                    res = 'ok';
                    setImmediate(function() {
                        callback(res);
                    });

                 })
            }
            else{
                res = 'ok';
                setImmediate(function() {
                        callback(res);
                });
            }
        }
        else{
            res = 'err'
            setImmediate(function() {
                callback(res);
            });
        };
        //console.log('hi',res);

    
}
exports.postCall = postCall;
exports.redirect = redirect;