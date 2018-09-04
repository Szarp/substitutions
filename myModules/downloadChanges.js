//downloadChanges.js
var zckoiz = require("./zckioz_mesLogistic.js");
var zso11 = require("./zsoServerComunication.js");
var setTime = require('./setTime.js');
var time = new setTime();
function downloadAll(){
    //getZckioz();
    getZso11();

}
function getZso11(){
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
}
function getZckioz(){
    zckoiz.subs(function(){console.log('downloaded changes zckoiz');});
}
exports.all=downloadAll;
