//moduleSwitch.js
var zckioz = require("./zckioz_mesLogistic.js");
var CE = require("./zso11_mesLogistic.js");

function moduleSwitch(messParams,event){
    //console.log("zck",zckioz.checkId(pageId))
    //console.log("ce",CE.checkId(pageId))
    if(zckioz.checkId(messParams.page)){
        zckioz.messageLogistic(messParams,event);
    }
    else if(CE.checkId(messParams.page)){
        CE.messageLogistic(messParams,event);
    }
    else{
        //console.log("im here");
        //console.log(messParams,event,pageId);
    }   
}
exports.messageLogistic=moduleSwitch;