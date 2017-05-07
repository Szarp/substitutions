/*
	create teachers list based on saved substitutions and add teachers to old substitutions
*/

//load required modules
var mongo = require('../myModules/mongoFunctions.js');

//create empty teachers list
var teachersList = [];

//get all substitutions
mongo.findByParam({}, {"substitution": true, "date": true, "teachersList": true}, 'substitutions', function(allSubs){ //get data for every day and request "substitution" array
	for(var a = 0; a < allSubs.length; a++){ //iterate array to get arrays with substitutions only for one day
		var oneDay = allSubs[a]; //get object with data for one day
		var oneDayTeachers = []; //create empty list with teachers from this day's substitutions
		if(oneDay && oneDay.substitution){
			var daySubs = oneDay.substitution; //get array with substitutions for one day
			for(var b = 0; b < daySubs.length; b++){ //iterate daySubs to get individual substitution objects
				var oneSub = daySubs[b]; //get 1 substitution
				if(oneSub.teachers){
					oneDayTeachers = oneDayTeachers.concat(oneSub.teachers);
					teachersList = teachersList.concat(oneSub.teachers); //append teacher(s) to the list (if present)
				}
				if(oneSub.changes && oneSub.changes.teachers){
					oneSubTeachers = oneDayTeachers.concat(oneSub.changes.teachers);
					teachersList = teachersList.concat(oneSub.changes.teachers); //append new (changed) teacher(s) (if present) to the list
				}
			}
		}
		if(oneDay){
			if(oneDay.teachersList == undefined){ //check if there is a teachersList or not
				oneDayTeachers = uniq(oneDayTeachers); //remove duplicates and sort
				var date = oneDay._id; //get day id (date)
				oneDay.teachersList = oneDayTeachers; //add teacher list
				mongo.modifyById(date, 'substitutions', oneDay){ //replace day object in db with a new one including teachersList
					console.log("Added following teachers to", date, ":\n", oneDayTeachers) //saved successfully, log saved list
				});
			} else {
				console.log("teachersList for", date, "already exist"); //teachersList present - everthing ok
			}
		}
	}
	teachersList = uniq(teachersList); //remove duplicates and sort
	mongo.modifyById('all', 'teachers', {"teachers": teachersList}, function(){ //save list to database
		console.log('saved list', teachersList); //saved successfully
	});
});

//function sorting array and removing duplicates
function uniq(a) {
	return a.sort().filter(function(item, pos, ary){
		return !pos || item != ary[pos - 1];
	})
}
