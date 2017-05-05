/*
	create teachers list based on saved substitutions
*/

//load required modules
var mongo = require('../myModules/mongoFunctions.js');

//create empty teachers list
var teachersList = [];

//get all substitutions
mongo.findByParam({}, {"substitution": true}, 'substitutions', function(allSubs){ //get data for every day and request "substitution" array
	for(var a = 0; a < allSubs.length; a++){ //iterate array to get arrays with substitutions only for one day
		var oneDay = allSubs[a]; //get object with data for one day
		if(oneDay && oneDay.substitution){
			var daySubs = oneDay.substitution; //get array with substitutions for one day
			for(var b = 0; b < daySubs.length; b++){ //iterate daySubs to get individual substitution objects
				var oneSub = daySubs[b]; //get 1 substitution
				if(oneSub.teachers){
					teachersList = teachersList.concat(oneSub.teachers); //append teacher to the list
				}
				if(oneSub.changes && oneSub.changes.teachers){
					teachersList = teachersList.concat(oneSub.changes.teachers); //add new teacher (if present to the list
				}
			}
		}
	}
	teachersList = uniq(teachersList); //remove duplicates and sort
	mongo.modifyById('all', 'teachers', {"teachers": teachersList}, function(){
		console.log('saved list', teachersList);
	});
});

//function sorting array and removing duplicates
function uniq(a) {
	return a.sort().filter(function(item, pos, ary){
		return !pos || item != ary[pos - 1];
	})
}
