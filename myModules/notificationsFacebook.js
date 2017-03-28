var facebook = require ('./facebookComunication.js'),
    setTime = require ('./setTime.js'),
    //link = require('./fbLinks.js'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    mongo = require('./mongoFunctions.js');

/* module to send notifications */
var time = new setTime();

function sendToId (id,callback){
    console.log('notification');
    var message = 'Welcome to my app';
    var redirect = 'https://192.166.218.253:8088/';
        facebook.createNotification(id,message,redirect, function(res){
         console.log('noti message for: ',id,res);
            
        });    
    setImmediate(function() {
            callback();
    });
}
function whoGetSubstitution(){
    
    
}


//notificationList(function(a){console.log(a);})
 function notificationList(callback){
     var name='person';
        //[collection,{data}]
        //var collectionName = collection;
        //var data = paramsToModify;
     
        var url = 'mongodb://localhost:27017/test2';
        mongo.findByParam({"personal.settings.notification":'yes',"system.connected":true},{"personal.id":1,"personal.settings":1},name,function(a){
            console.log(a);
            var list=[];
            var arr={};
            for(var i=0;i<a.length;i++){
                arr['id']=a[i].personal['id'];
                arr['class']=a[i].personal.settings['setClass'];
                list[i]=arr;
                arr={};
            }
            
            setImmediate(function(){
					callback(list);
            }); 
            
        })
      
        
        //db.close();
 }
//notification(['2ga'],function(){
//    console.log('a');
//});

    
function classListFromDate(date,callback){
    //var classList=[];
     mongo.findById(date,'substitutions',function(e,doc){
         //console.log('doc',doc.substitution);

        setImmediate(function(){
            callback(doc.userList);
        });   
    })
}
    