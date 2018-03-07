//moduleSwitch.js
var zckioz = require("./zckioz_mesLogistic.js");
var CE = require("./zso11_mesLogistic.js");
function messageLogistic(params,event){
    var mess={}
    mess["timestamp"]=event.timestamp;
    mess["sender"]=event.sender.id;
    mess["page"]=event.recipient.id;
    mess["type"]="";
    //console.log('begin');
    //switch(true){
        if(params.attachments == true){
            mess["type"]="attachments";
            mess["attachments"]=event.message.attachments;
            //console.log('    got attachments')
        }
        if(params.text == true){
            mess["type"]="text";
            mess["text"] = event.message.text;
            //console.log('    text type')
        }
        if(params.read == true){
            mess["type"]="read";
            mess["watermark"]=event.read.watermark;
            //console.log('    user read message')
        }
        if(params.payload == true){
            mess["type"]="postback";
            mess["payload"]=event.postback.payload;
            //console.log('    postback mess');
        }
        if(params.delivery == true){
            mess["type"]="delivery";
            mess["watermark"]=event.delivery.watermark;
            //console.log('   deliverd message');
        }
        if(params.echo == true){
            mess["echo"]=true;
            //console.log('   message from server')
        }
        //break;
    //}
    moduleSwitch(mess)
    //messageDistribution(mess);
}



function moduleSwitch(messParams){
    if(zckioz.checkId(messParams.page)){
        zckioz.messageDistribution(messParams);
    }
    else if(CE.checkId(messParams.page)){
        CE.messageDistribution(messParams);
    }
    else{
        //console.log("im here");
        //console.log(messParams,event,pageId);
    }   
}
exports.messageLogistic=messageLogistic;