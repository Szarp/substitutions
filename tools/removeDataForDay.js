/*
	This module is made for testing action
	on substitutions download.
	It removes substitutions for selected day,
	so server will download it again.
*/
//require communication and time module
var sTime = require('../myModules/setTime.js'),
	manageSubs = require('../myModules/zsoServerComunication.js');
const mongo3 = require("../myModules/mongoFunctions3");

var time = new sTime();
time.todayIs(); //set today
//time.tommorowIs(); //set tomorrow
//time.theDayAfterTomorrowIs(); //set the day after tomorrow

var date = time.displayTime();
var data = {
	'substitution': 'no substitutions',
	'userList': {}
};

manageSubs.save(date, data, function(){
	mongo3.findById(date,"substitutions",function(err,x){
		console.log("save substitution "+  x.userList,x.date);
	});
	console.log('removed');
});
