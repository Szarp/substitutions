//downloadChanges.js
//var zckoiz = require("./zckioz_mesLogistic.js");
//var zso11 = require("./zsoServerComunication.js");
const { EduPageSubstitutions } = require("./edupageParser");
const messenger = require("./messengerBot");
const zso11Config = require("./configs/zso11");
var setTime = require("./setTime.js");

var time = new setTime();

function downloadAll() {
	//getZckioz();
	getZso11();
}

/*function getZso11(){
	time.tommorowIs();
	zso11.subs(time.displayTime(),function(y){
		time.todayIs();
		zso11.subs(time.displayTime(),function(b){
			time.theDayAfterTomorrowIs();
			zso11.subs(time.displayTime(),function(x){
				  console.log('downloaded changes zso11');
			});
		});
	});
}*/

const {classList} = zso11Config;
const zso11Parser = new EduPageSubstitutions("https://zso11.edupage.org", classList);
function getZso11() {
	time.todayIs();
	zso11Parser.downloadAndSave(time.displayTime())
		.then(() => {
			messenger.notification(null, time.displayTime(), () => { });
			time.tommorowIs();
			return zso11Parser.downloadAndSave(time.displayTime());
		})
		.then(() => {
			messenger.notification(null, time.displayTime(), () => { });
			time.theDayAfterTomorrowIs();
			return zso11Parser.downloadAndSave(time.displayTime());
		})
		.then(() => {
			messenger.notification(null, time.displayTime(), () => {
				console.log(`${new Date().toLocaleString()}: Substitutions for zso11 downloaded and saved. Messenger module finished it's work.`);
			});
		})
		.catch(e => {
			console.error("Downloading substitutions failed:\n", e);
		});
}

/*function getZckioz() {
	zckoiz.subs(function () { console.log('downloaded changes zckoiz'); });
}*/
exports.all = downloadAll;
