//save requests to files
var mongo = require('./mongoFunctions.js'),
	assert = require('assert'),
	request= require('request'),
	jsonFromHtml = require('./getJsonFromHtml.js'),
	userMod = require('./getSubstitution.js'),
	querystring = require('querystring'),
	messenger = require('./messengerBot.js'),
	setTime = require('./setTime.js'),
	callFunc = require('./postCallFunctions.js'),
    mongo_v2 = require('./mongoConnection.js');
var config = require('./configs/zso11');

/*
	module to comunicate with ZSO11 server
*/

var time = new setTime();
var sub = new mongo_v2.substitutions(config.db);
var getSomeSubstitution = function(date,callback){
	time.tommorowIs();
	var tomorrow = time.displayTime();
	var day = '';
	if (date == tomorrow){
		day = 'tomorrow';
	} else {
		time.todayIs();
		var today = time.displayTime();
		if (date == today){
			day = 'today';
		} else {
			time.theDayAfterTomorrowIs();
			var tdat = time.displayTime();
			if (date == tdat){
				day = 'TDAT'; //The Day After Tomorrow
			}
		}
	}
	getData(date,function(data){
		convertToSubstitutions(data,function(convertedData){
			classListFromDate(convertedData,function(res){
				teachersList(convertedData, function(teachers){
					var dataToSave={};
					dataToSave['substitution']=convertedData;
					dataToSave['userList']=res;
					dataToSave['teachersList'] = teachers;
					//console.log('before saving'+ dataToSave['userList']);
					saveSubstitutions(date,dataToSave,function(){
						//mongo.findById(date,'substitutions',function(err,x){
							//console.log('save substitution '+  x.userList,x.date,x.teachersList);
							setImmediate(function() {
								callback(convertedData);
								messenger.notification(day, date, function(res){
									//console.log("mess",res);
								});
							});
						//})
					})
					mongo.findById('all', 'teachers', function(erro, obj){
						var beforeTe = obj.teachers;
						var newTe = beforeTe.concat(teachers);
						newTe = uniq(newTe);
						if(!arrayEqual(newTe, beforeTe) && newTe.length > beforeTe.length){
							mongo.modifyById('all', 'teachers', {'teachers': teachers}, function(){
								console.log('Teachers list updated');
							})
						}
					})
				})
			})
		})
	})
}

function teachersList(convertedData, callback){
	var teachers = [];
	if(convertedData != 'no substitutions'){
		for(var n = 0; n < convertedData.length; n++){
			var oneSub = convertedData[n];
			if(oneSub.teachers){
				teachers = teachers.concat(oneSub.teachers);
			}
			if(oneSub.changes && oneSub.changes.teachers){
				teachers = teachers.concat(oneSub.changes.teachers);
			}
		}
		teachers = uniq(teachers);
		setImmediate(function(){
			callback(teachers);
		});
	} else {
		setImmediate(function(){
			callback([]);
		});
	}
}

//function sorting array and removing duplicates
function uniq(a) {
	return a.sort().filter(function(item, pos, ary){
		return !pos || item != ary[pos - 1];
	})
}

function classListFromDate(convertedData,callback){
	var classList=[];
	if (convertedData =='no substitutions'){
		setImmediate(function(){
			callback({});
		});
	}
	else{
		var changes = convertedData;
		for(var i=0;i<changes.length;i++){
			var oneChange = changes[i];
			var newClass = oneChange['classes'];
			for(var j =0;j<newClass.length;j++){
				if(classList.indexOf(newClass[j])==-1){
					classList[classList.length]=newClass[j];
				}
			}
		}
		setImmediate(function(){
			callback(classList);
		});
	}
}

var getData = function(date,callback){
	downloadData(date,function(err,body){
		if(err){
			getCookie(function(){
				downloadData(date,function(err1,newBody){
					if(!err1){
						setImmediate(function() {
							callback(newBody);
						});
					} else {
						console.log("Error getting data! New data won't be saved. Tryin again in 10min.");
					}
				})
			});
		}
		else{
			setImmediate(function() {
				callback(body);
			});
		}
	});
}

function getParams(callback){
	var url='http://zso11.edupage.org/substitution/?';
	request(url,function(err,res,body){
		if(!err && res.statusCode ==200){
			getGPIDandGSH(body,function(params){
				var cookie=res.headers['set-cookie'];
				var data = {
					'gpid':params[0],
					'gsh':params[1],
					'cookie':cookie
				}
				mongo.save(['pageParams',data],function(){
					console.log('data added: '+data);
				})
			});
			//save somewhere
		}
		setImmediate(function() {
			callback();
		});
	});
}

function downloadData(date,callback){
	var url1='http://zso11.edupage.org/gcall';
	mongo.findById('params','pageParams',function(err1,params){
		//console.log('params',params);
		if(params == null){
			getCookie(function(dt){
				console.log(dt);
				downloadData(date, callback);
			})
		} else {
			var cookie=params['cookie'];
			var form = {
				gpid:params['gpid'],
				gsh:params['gsh'],
				action:"switch",
				date:date,
				_LJSL:"2,1"
			};
			var formData = querystring.stringify(form);
			var contentLength = formData.length;
			request({
				headers: {
					'Content-Length': contentLength,
					'Content-Type': 'application/x-www-form-urlencoded',
					'Cookie' : cookie
				},
				uri: url1,
				body: formData,
				method: 'POST'
			}, function (err, res, body) {
				setImmediate(function() {
					if(err || res.statusCode != 200){
						console.log('Error:', err)
						if(res && res.statusCode) console.log('Status code:', res.statusCode);
						callback(true, body);
					} else {
						callback(body.length<100,body);
					}
				});
			});
		}
	});
}

var getCookie=function(callback){
	var url='http://zso11.edupage.org/substitution/?';
	request(url,function(err,res,body){
		if(!err && res.statusCode ==200){
			getGPIDandGSH(body,function(params){
				var cookie=res.headers['set-cookie'];
				var data = {
					'gpid':params[0],
					'gsh':params[1],
					'cookie':cookie
				}
				console.log(JSON.stringify(data));
				mongo.modifyById('params','pageParams',data,function(){
					console.log('cookies saved: '+data);
					setImmediate(function() {
						callback(data);
					});
				})
			});
			//save somewhere
		}
	});
}

function checkIfAnySubstitutions(callback){
	var res;
	getData(date,function(body){
		if(body.indexOf('column') != -1){
			res=true;
			console.log('i see something');
		}else{
			res=false;
			console.log('nothing')
		}
		setImmediate(function() {
			callback(res);
		});
	})
}
/*function saveSubstitutions(date,data,callback){
    sub.save(date,data,function(){
      setImmediate(function() {
			callback(); //callback not necessary
		});
    });
}*/
function saveSubstitutions(date,data,callback){
	var dataToSave={};
		dataToSave['substitution']=data.substitution;
		dataToSave['userList']=data.userList;
		dataToSave['date']=date;
		dataToSave['teachersList'] = data.teachersList;
	mongo.modifyById(date,'substitutions',dataToSave,function(){
		setImmediate(function() {
			callback(); //callback not necessary
		});
		//ok;
	})
}

function convertToSubstitutions(data,callback){
	var substitution2 =new jsonFromHtml();
	var user2= new userMod();
	var allChanges;
	substitution2.fileString=data;
	var err=substitution2.testIfCorrectFile();
	if(err){
		substitution2.getJsonObj();
		user2.keyArray=JSON.parse(substitution2.keyObj);
		user2.dataArray=JSON.parse(substitution2.dataObj);
		allChanges=user2.changes();
	}
	else{
		allChanges='no substitutions';
	}
	setImmediate(function() {
		callback(allChanges); //respond with converted changes
	});
}

function getGPIDandGSH_ (data,callback){ //take params to send request
	var a=data.indexOf('gsh');
	var gpidIndex;
	var gshIndex;
	for (var i=0; i<11;i++){
		if (data.charAt(a-i)=='='){
			gpidIndex=a-i;
			break;
		}
	}
	for (var i=0; i<20;i++){
		if (data.charAt(a+i)=='"'){
			gshIndex=a+i;
			break;
		}
	}
	var gpid=data.slice(gpidIndex+1,a-1);
	var gsh=data.slice(a+4,gshIndex);
	setImmediate(function() {
		callback([gpid,gsh]);
	});
}
function getGPIDandGSH (data,callback){ //take params to send request
	var tuSzukamy = data; // źródło
	var regexp = /ASC.gsechash="(?<gsh>[\w]*?)";/g;
	var gsh = regexp.exec(tuSzukamy).groups.gsh;
	var gpid = "no param";
/*
	var a=data.indexOf('gsh');
	var gpidIndex;
	var gshIndex;
	for (var i=0; i<11;i++){
		if (data.charAt(a-i)=='='){
			gpidIndex=a-i;
			break;
		}
	}
	for (var i=0; i<20;i++){
		if (data.charAt(a+i)=='"'){
			gshIndex=a+i;
			break;
		}
	}
	var gpid=data.slice(gpidIndex+1,a-1);
	var gsh=data.slice(a+4,gshIndex);
	*/
	setImmediate(function() {
		callback([gpid,gsh]);
	});
}
function arrayEqual(array0, array){
	if (array0.length != array.length){
		return false;
	}
	for (var i = 0; i < array0.length; i++) {
		if (array0[i] != array[i]) {
			return false;
		}
	}
	return true;
}

exports.subs = getSomeSubstitution;
exports.getData = getData;
exports.downloadData = downloadData;
exports.getCookie = getCookie;
exports.convert = convertToSubstitutions;
exports.save = saveSubstitutions;
exports.getGPIDandGSH = getGPIDandGSH;