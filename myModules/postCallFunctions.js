    var setTime = require('./setTime.js'),
        //callFunc = require('postCallFunctions.js'),
        mongo = require('./mongoFunctions.js');

var time = new setTime();
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

function getSettings(userId,callback){
    mongo.findById(userId,'person',function(err,doc){
        if (err){console.log('prolem with settings: ',userId)};
        console.log('Settings file: ',doc);
        var params = (doc.personal['settings']);
        if(params == ''){params={setClass:'all',notification:'no'}}
        var table=[];
        table[0]=params.setClass;
        table[1]=params.notification;
        pageSettings['formValues']=table;
        res = pageSettings; 
        setImmediate(function() {
            callback(res);
        });
                //console.log('response Settings',res);
    })        
}

function getChanges(userId,body,callback){
                //console.log('response Changes')
    if(body['param']=='today'){
        time.todayIs();
    }
    else{
        time.tommorowIs();
    }
    console.log('requested date: ',time.displayTime());
    mongo.findById(time.displayTime(),'substitutions',function(err,obj){    //console.log(err,obj);
        if(err){console.log('err in sending substitutions')}
        var objToSend={};
        if(obj){
            objToSend['substitution']=obj['substitution'];
            if(obj['date'] == undefined){obj['date']='31-12-2016'}
            objToSend['date']=obj['date'];
        } 
        else {
            objToSend['substitution']='';
			objToSend['date']='ERROR';
        }
        res = objToSend;
        setImmediate(function() {
            callback(res);
        });
    });
}
function classList(body,callback){
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
        res = obj['userList'];
        setImmediate(function() {
            callback(res);
        });
    });
}
function message(userId,body,callback){
    mongo.save(['messages',{id:userId,message:body.param,time:new Date()}],function(){
        res = 'Dziękujemy za wiadomość';
        setImmediate(function() {
            callback(res);
        });
    }); 
}
function saveSettings(userId,body,callback){
    if(userId!="0000"){
        console.log('saving chnges to: '+userId);
        var form={};
        form['setClass'] = body.setClass;
        form['notification'] = body.notification;
         mongo.modifyById(userId,'person',{"personal.settings":form},function(){
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
function picture(userId,callback){
    if(userId != "0000"){
         mongo.findById(userId,'person',function(err,obj){
        //console.log(err,obj);
        if(err){console.log('err in sending picture')}
             console.log('some fond object:',obj.personal.picture); //found? weź się naucz anglijskiego
        res = obj.personal.picture;
        setImmediate(function() {
            callback(res);
        });
    });
    }
    else{
        res = '/img/unknown.gif';
        setImmediate(function() {
                callback(res);
        });
    }
}
exports.getSettings = getSettings;
exports.getChanges = getChanges;
exports.classList = classList;
exports.message = message;
exports.saveSettings = saveSettings;
exports.picture = picture;