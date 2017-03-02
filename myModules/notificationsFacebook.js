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
createClassList();
function createClassList(){
    
    var classList=[];
    time.tommorowIs();
    classListFromDate(time.displayTime(),function(list){
        console.log(list);
    })
    //time.displayTime();

}
//notification(['2ga'],function(){
//    console.log('a');
//});
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
                console.log("hi",doc.personal.settings);
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
    
function classListFromDate(date,callback){
    //var classList=[];
     mongo.findById(date,'substitutions',function(e,doc){
         //console.log('doc',doc.substitution);

        setImmediate(function(){
            callback(doc.userList);
        });   
    })
}
    