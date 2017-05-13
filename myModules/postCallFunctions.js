var setTime = require('./setTime.js'),
	mongo = require('./mongoFunctions.js'),
	secretToken = require('./secretTokenGenerator.js');

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

function getChanges(body,callback){ //resposne app's format changes
    if(body['param']=='today'){
        time.todayIs();
    } else if(body['param']=='TDAT'){
		time.theDayAfterTomorrowIs();
	} else {
        time.tommorowIs();
    }
    console.log('requested date: ',time.displayTime());
    mongo.findById(time.displayTime(),'substitutions',function(err,obj){
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
function allTeachers(callback){
	mongo.findById('all', 'teachers', function(err, obj){
		if(err){
			console.log('Error getting teachersList');
		} else {
			var res = obj.teachers;
			setImmediate(function(){
				callback(res);
			});
		}
	});
}
function teachersList(body, callback){
	if(body['param']=='today'){
		time.todayIs();
	} else {
		time.tommorowIs();
	}
	mongo.findById(time.displayTime(), 'substitutions', function(err, obj){
		if(err){
			console.log('Error getting substitutions');
		} else {
			var res = obj.teachersList;
			setImmediate(function(){
				callback(res);
			});
		}
	});
}
function classList(body,callback){ //response classList from day
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
//res:text
function message(userId,body,callback){ //saves message from app
    mongo.save(['messages',{id:userId,message:body.param,time:new Date()}],function(){
        res = 'Dziękujemy za wiadomość';
        setImmediate(function() {
            callback(res);
        });
    }); 
}
//res: ok
function saveSettings(userId,body,callback){ //saves settings from app
    //userId String
    //body Array 
    if(userId!="0000"){
        console.log('saving chnges to: '+userId);
        var form={};
        form['setClass'] = body.setClass;
        form['notification'] = body.notification;
		form['setTeacher'] = body.teacher;
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
//res: picture link
function picture(userId,callback){ //res id's picture
    //userId String
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
function changesForMessenger(reqClass,day,callback){ //response Messenger's format changes
    //reqClass String [class]
    //day String [today;tommorow]
    getChanges({param:day},function(obj){
        //console.log(obj)
        var tableOfMesseges=[];
		var msg = "";
        //console.log(obj);
        if(obj['substitution'] != 'no substitutions'){
            var subs = obj['substitution'];
            for(var i = 0; i < subs.length; i++){
                var oneSub = subs[i];
                var classIDs = oneSub.classes;
                if(classIDs){
                    for(var n = 0; n < classIDs.length; n++){
                        if(classIDs[n] == reqClass && oneSub.cancelled[0] || classIDs[n] == reqClass && oneSub.substitution_types){
							if(reqClass == '1b' && day == 'tomorrow'){
								msg = "Wspaniała Dosia przewidziała zastępstwa i powiada wam, że takie zastępstwo mieć jutro będziecie:\n";
							} else if(reqClass == '1b' && day == 'today'){
								msg = "Wspaniała Dosia przewidziała zastępstwa i powiada wam, że takie zastępstwo dziś macie:\n";
							}
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
        }
        setImmediate(function() {
            callback(tableOfMesseges);
        });
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