var facebook = require ('./facebookComunication.js'),
    setTime = require ('./setTime.js'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    mongo = require('./mongoFunctions.js');

/* module to send notifications */
var time = new setTime();

function sendToId (id,callback){
    var message = 'Welcome to my app';
    var redirect = 'https://192.166.218.253:8088/';
    for(var i=0;i<idList.length;i++){
        facebook.createNotification(idList[i],message,redirect, function(res){
         console.log('noti message for: ',idList[i],res);
            
        });    
    }
    setImmediate(function() {
            callback(body);
    });
}
function whoGetSubstitution(){
    
    
}
function createClassList(){
    
    var classList=[];
    time.todayIs();

}
notification(['a','b','c'],function(){
    console.log('a');
});
 function notification(classList,callback){
     var name='person';
        //[collection,{data}]
        //var collectionName = collection;
        //var data = paramsToModify;
     
        var url = 'mongodb://localhost:27017/test2';
        MongoClient.connect(url, function(err, db) {
            var userList=[];
            assert.equal(null,err);
            var collection=db.collection(name);
            collection.find().forEach(function(doc){
                console.log("hi",doc.settings);
                if(doc.settings =='' || doc.settings == undefined ||doc.settings == null){
                 //do nothing   
                }
                else{
                    if(doc.settings['notification']=='yes'){
                        if(classList.indexOf(doc.settings['setClass']) != -1){
                            sendToId(doc._id,function(errMes){
                                console.log(errMes);
                            })
                        }
                    }
                }
               //console.log("hi",doc.settings)
            });
            //console.log('hi', userList);
            setImmediate(function(){
                callback();
            });   
        db.close();
      });
      
        
        //db.close();
 }
    
function classsListFromDate(date,callback){
     mongo.findById(date,'substitutions',function(e,doc){
        for(var i=0;i<doc.length;i++){
            var change = doc[i];
            var newClass = change['classes'];
            for(var j =0;j<newClass.length;j++){    
                if(newClass.indexOf(newClass[j])==-1){
                    classList[classList.length]=newClass[j];
                }
            }
        }
        setImmediate(function(){
            callback(classList);
        });   
    })
}
    