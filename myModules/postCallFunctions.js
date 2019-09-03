var setTime = require('./setTime.js'),
	secretToken = require('./secretTokenGenerator.js');
const mongo3 = require("./mongoFunctions3");

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
/*mongoPerson.find({_id:"0005"},{},function(e,r){
    console.log("005: ",r);
})*/
//mongoPerson.collectionCheck();
function getSettings(userId, callback) {
    mongo3.findById(userId, "person", (err, doc) => {
        if (!err) {
            try {
                pageSettings.formValues = [doc.personal.settings.setClass, doc.personal.settings.notification, doc.personal.settings.setTeacher];
                setImmediate(function () {
                    callback(pageSettings);
                });
            } catch (e) {
                console.error(e);
                pageSettings.formValues = ["all", "no"];
                setImmediate(function () {
                    callback(pageSettings);
                });
            }
        } else {
            console.error(err);
            pageSettings.formValues = ["all", "no"];
            setImmediate(function () {
                callback(pageSettings);
            });
        }
    });
}
function getSettings_old(userId,callback){
    mongo3.findById(userId,'person',function(err,doc){
        if (err){console.error('prolem with settings: ',userId)};
        //console.log('Settings file: ',doc);
        var params = (doc.personal['settings']);
        if(params == ''){params={setClass:'all',notification:'no'}}
        var table=[];
        table[0]=params.setClass;
        table[1]=params.notification;
		if(params.setTeacher){
			table[2]=params.setTeacher;
		}
        pageSettings['formValues']=table;
        res = pageSettings;
        setImmediate(function() {
            callback(res);
        });
                //console.log('response Settings',res);
    })
}

/*getChanges({param:"today"},function(res){ //getchanges test
    console.log("getChanges test: ",res);
})*/
function getChanges(body,callback){ //resposne app's format changes
    if(body['param']=='today'){
        time.todayIs();
    } else if(body['param']=='TDAT'){
		time.theDayAfterTomorrowIs();
	} else {
        time.tommorowIs();
    }
    var day = time.displayWeekDay();
    //console.log('requested date: ',time.displayTime());
    mongo3.findByParam({ _id: time.displayTime() }, {}, "substitutions", function (err, elems) {
        var obj = elems[0];
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
        setImmediate(function(){
            callback(objToSend,day);
        });
    });
}
function getChanges_old(body,callback){ //resposne app's format changes
    if(body['param']=='today'){
        time.todayIs();
    } else if(body['param']=='TDAT'){
		time.theDayAfterTomorrowIs();
	} else {
        time.tommorowIs();
    }
    console.log('requested date: ',time.displayTime());
    mongo3.findById(time.displayTime(),'substitutions',function(err,obj){
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
        setImmediate(function(){
            callback(res);
        });
    });
}

function allTeachers_new(callback){


}

function allTeachers(callback){
	mongo3.findById('all', 'teachers', function(err, obj){
		if(err){
			console.log('Error getting teachersList');
		} else {
            var res;
            if(obj)
                res=obj["teachers"];
            else
                res="";
			setImmediate(function(){
				callback(res);
			});
		}
	});
}
function teachersList(body,callback){
	if(body['param']=='today'){
		time.todayIs();
	} else {
		time.tommorowIs();
	}
    mongo3.findByParam({ _id: time.displayTime() }, {}, "substitutions", function (err, obj) {
		if(err){
			console.log('Error getting substitutions');
		} else {
			var res = obj[0].teachersList;
            console.log ("res",res);
			setImmediate(function(){
				callback(res);
			});
		}
	});
}
function teachersList_old(body, callback){
	if(body['param']=='today'){
		time.todayIs();
	} else {
		time.tommorowIs();
	}
	mongo3.findById(time.displayTime(), 'substitutions', function(err, obj){
		if(err){
			console.log('Error getting substitutions');
		} else {
			var res = obj["teachersList"];
			setImmediate(function(){
				callback(res);
			});
		}
	});
}
/*
classList({param:"tommorow"},function(res){//classList test
    console.log("classlist test:",res);
})
*/
function classList(body,callback){ //response classList from day
                //console.log('response Changes')
    if(body['param']=='today'){
        time.todayIs();
    }
    else{
        time.tommorowIs();
    }
    //console.log('requested date: ',time.displayTime());
    mongo3.findByParam({ _id: time.displayTime() }, {}, "substitutions", function (err, obj) {
        //console.log(err,obj);
        if(err){console.log('err in sending substitutions')}
        //console.log("etst: ",obj);
        if(obj[0])
            res = obj[0]['userList'];
        else{res=[]}
        setImmediate(function() {
            callback(res);
        });
    });
}
function classList_old(body,callback){ //response classList from day
                //console.log('response Changes')
    if(body['param']=='today'){
        time.todayIs();
    }
    else{
        time.tommorowIs();
    }
    //console.log('requested date: ',time.displayTime());
    mongo3.findById(time.displayTime(), "substitutions", function (err, obj) {
        //console.log(err,obj);
        if(err){console.log('err in sending substitutions')}
        res = obj['userList'];
        setImmediate(function() {
            callback(res);
        });
    });
}
//res:text
function message(userId, body, callback) { //saves message from app
    mongo3.save(["messages", { id: userId, message: body.param, time: new Date() }], function (err) {
        if (err) console.error(err);
        setImmediate(function () {
            callback(err ? "Wystąpił błąd. Spróbuj ponownie" : "Dziękujemy za wiadomość");
        });
    });
}
/* saveSettings test
saveSettings('7k8zUbHw4YhXG',{setClass:"1b",notification:"yes",teacher:""},function(r){
    mongoPerson.find({_id:'7k8zUbHw4YhXG'},{"personal.settings":true},function(e,res){
        console.log("saveSettings test: ",res[0].personal);
    })
})*/

function saveSettings(userId, body, callback) { //saves settings from app
    //userId String
    //body Array
    if (userId != "0000") {
        console.log('saving chnges to: ' + userId);
        var form = {};
        form['setClass'] = body.setClass;
        form['notification'] = body.notification;
        form['setTeacher'] = body.teacher;
        mongo3.modifyById(userId, "person", { "personal": { settings: form } }, function (e) {
            if(e) console.error(e);
            setImmediate(function () {
                callback(e ? "Not ok. A problem occured" : "ok");
            });
        });
    }
    else {
        res = 'ok';
        setImmediate(function () {
            callback(res);
        });
    }
}
//res: picture link
/*
picture('7k8zUbHw4YhXG',function(res){ //picture test
    console.log("picture test: ",res);
})*/
function picture(userId, callback) { //res id's picture
    //userId String
    if (userId != "0000") {
        mongo3.findById(userId, "person", function (err, obj) {
            if (err) console.error(err)
            setImmediate(function () {
                callback(err ? "/img/unknown.gif" : obj.personal.picture);
            });
        });
    }
    else {
        setImmediate(function () {
            callback("/img/unknown.gif");
        });
    }
}
function picture_old(userId,callback){ //res id's picture
    //userId String
    if(userId != "0000"){
         mongo3.findById(userId,'person',function(err,obj){
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
function changesTeacherForMessenger(reqTeacher, day, callback){
	getChanges({param:day},function(obj){
		var tableOfMesseges=[];
		var msg = "";
		if(obj['substitution'] != 'no substitutions'){
            var subs = obj['substitution'];
            for(var i = 0; i < subs.length; i++){
                var oneSub = subs[i];
                var teacherIDs = oneSub.teachers[0].toLowerCase();
				var altTeacherId = 'nothing';
				if(oneSub.changes && oneSub.changes.teachers){
					altTeacherId = oneSub.changes.teachers[0].toLowerCase();
				}
                if(teacherIDs){
					if(teacherIDs == reqTeacher && oneSub.cancelled[0] || teacherIDs == reqTeacher && oneSub.substitution_types || altTeacherId == reqTeacher){
						var changes = oneSub['changes'];
						if(oneSub.cancelled[0]){
							msg+='anulowanie';
						}else {
							msg+='Typ: ' + oneSub.substitution_types;
						}
						msg+='\nLekcja: ' + oneSub.periods;
						msg+='\nNauczyciel: ' + oneSub.teachers;
						if(changes){
							if(changes.teachers){
								msg+=' => ' + changes.teachers;
							}
						}
						msg+='\nPrzedmiot: ' + oneSub.subjects;
						if(changes){
							if(changes.subjects){
								msg+= ' => ' + changes.subjects;
							}
						}
						msg+='\nSala: ' + oneSub.classrooms;
						if(changes){
							if(changes.classrooms){
								msg+=' => ' + changes.classrooms;
							}
						}
						msg+='\nKlasa: ';
						for(var a = 0; a < oneSub.classes.length; a++){
							if(a != 0){
								msg+=', ';
							}
							msg+=oneSub.classes[a];
						}
						if(oneSub.groupnames){
							if(oneSub.groupnames != ""){
								msg+='\nGrupa: ' + oneSub.groupnames;
							}
						}
						if(oneSub.note){
							if(oneSub.note != ""){
								msg+='\nKomentarz: '  + oneSub.note;
							}
						}
						tableOfMesseges[tableOfMesseges.length]=msg;
						msg='';
					}
                }
            }
        }
        setImmediate(function() {
            callback(tableOfMesseges);
        });
    });
}

//res: Table of messages to send
//changesForMessenger("IR","tommorow",function(a,b){console.log(a,b)});
function changesForMessenger(reqClass,day,callback){ //response Messenger's format changes
    reqClass=reqClass.toUpperCase();
    //reqClass String [class]
    //day String [today;tommorow]
    //getChanges({param:day},function(obj,weekDay){
    if(day=='today'){
        time.todayIs();
    } else if(day=='TDAT'){
		time.theDayAfterTomorrowIs();
	} else {
        time.tommorowIs();
    }
    var day = time.displayWeekDay();
    mongo3.findByParam({ _id: time.reverseTime() }, {}, "substitutions", function (e, obj) {//console.log(e,obj)
        if(obj[0]!==undefined){
            obj=obj[0];
            var tableOfMesseges=[];
            var msg = "";
            //console.log(obj);
            if(obj['substitution'] != 'no substitutions'){
                var subs = obj['substitution'];
                //console.log(subs)
                for(var i = 0; i < subs.length; i++){
                    var oneSub = subs[i];
                    var classID = oneSub.className;

                    if(reqClass == classID){
                        msg+=oneSub.teacher+"\n";
                        msg+=oneSub.text;
                        tableOfMesseges[tableOfMesseges.length]=msg;
                        msg='';
                    }
                }
            }
            setImmediate(function() {
                callback(tableOfMesseges,day);
            });
        }
        else{
            setImmediate(function() {
                callback([],day);
            });
        }
    });
}
function tokenCheck(userId,body,callback){
    if(userId != "0000"){
        secretToken.appCheck(userId,body.token,function(status){
            var res =''
            if(status == true){
                res = 'Dziękujemy. Konto zostało połączone.';
            }
            else{
                res = 'Token nieprawidłowy. Spróbuj jeszcze raz.';

            }
            setImmediate(function() {
                callback(res);
            });
        })
    }
    else {
        setImmediate(function() {
            callback('You must be loged in.');
        });
    }
}
function tokenGenerate(userId,callback){
    if(userId != "0000"){
        secretToken.appRequest(userId, function(tok){
            setImmediate(function() {
                callback(tok);
            });
        })
    }
    else {
        setImmediate(function() {
            callback('You must be loged in.');
        });
    }
}
function checkLogin(userId, callback){
    if(userId=='0000'){
        setImmediate(function(){
            callback({isLogged: false, connected: false});
        });
    } else {
        mongo3.findByParam({ _id: userId }, {}, "person", function (err, obj) {
            if (!err) {
                setImmediate(function () {
                    console.log("obj", obj);
                    callback({ isLogged: true, connected: obj[0].system.connected });
                });
            } else {
                console.error(err);
            }
        });
    }
}
function checkLogin_old(userId, callback){
    if(userId=='0000'){
        setImmediate(function(){
            callback({isLogged: false, connected: false});
        });
    } else {
        mongo3.findById(userId, 'person', function(err, obj){
            if(!err){
                setImmediate(function(){
                    callback({isLogged: true, connected: obj.system.connected});
                });
            }
        })
    }
}
exports.getSettings = getSettings;
exports.getChanges = getChanges;
exports.classList = classList;
exports.message = message;
exports.saveSettings = saveSettings;
exports.picture = picture;
exports.changesForMessenger = changesForMessenger;
exports.tokenGenerate = tokenGenerate;
exports.tokenCheck = tokenCheck;
exports.teachersList = teachersList;
exports.allTeachers = allTeachers;
exports.changesTeacherForMessenger = changesTeacherForMessenger;
exports.checkLogin = checkLogin;