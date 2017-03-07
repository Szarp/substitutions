var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
    /*
    Module to comunicate with mongo
    
    */
function findByParam(paramAndValue,paramsToDisplay,collectionName,callback){
    var url = 'mongodb://localhost:27017/test2';
    MongoClient.connect(url, function(err, db) {
        assert.equal(null,err);
        var collection=db.collection(collectionName);
        var arrayOfElements=[];
        //var x =collection.find({});
        //console.log('x',x);
        //var buffer=[];
        collection.find(paramAndValue,paramsToDisplay).toArray(function(e, doc) {
              //console.log(doc);
            if(doc){
                //console.log(doc);
                //console.log(e);
                /*for(k in paramAndValue){
                    //console.log(doc[k]);
                    if(doc[k]==paramAndValue[k]){
                        arrayOfElements[arrayOfElements.length]=doc;
                      //console.log('ho',doc);
                    }
                }
                */
                setImmediate(function() {
                    callback(doc);
                });
            
                //buffer[buffer.length]=doc;
            }
            else{
                //console.log('hi');
                setImmediate(function() {
                    callback(null);
                });
            }
        });    
        db.close();
    })
  
    
}    


function saveToCollection(params,callback){
        //[collection,{data}]
        var collectionName = params[0];
        var data = params[1];
        var url = 'mongodb://localhost:27017/test2';
        MongoClient.connect(url, function(err, db) {
            assert.equal(null,err);
            var collection=db.collection(collectionName);
            collection.insert(data, {w: 1}, function(err1, records){
                assert.equal(null,err1);
                //console.log("Record added as "+records[0]._id);
            });
            setImmediate(function() {
                callback();
            });
        db.close();
        })
    }  
    function modifyById(id,collectionName,paramsToModify,callback){
        //[collection,{data}]
        //var collectionName = collection;
        var data = paramsToModify;
        //console.log(data);
        var url = 'mongodb://localhost:27017/test2';
        MongoClient.connect(url, function(err, db) {
            assert.equal(null,err);
            var collection=db.collection(collectionName);
            collection.findAndModify(
              {_id: id}, // query
                [['_id','asc']],  // sort order
              {$set: paramsToModify}, // replacement, replaces only the field "hi"
              {upsert:true}, // options
              function(err, object) {
                  if (err){
                      //console.warn(err.message);  // returns error if no matching object found
                  }else{
                    setImmediate(function() {
                        callback();
                    });
                     // console.log(object);
                  }
              });
    
        db.close();
        })
    }
    function findById(id,collectionName,callback){
        //[collection,{data}]
        //var collectionName = collection;
        //var data = paramsToModify;
        var url = 'mongodb://localhost:27017/test2';
        MongoClient.connect(url, function(err, db) {
            assert.equal(null,err);
            var collection=db.collection(collectionName);
            collection.findOne({_id:id},function(err1, doc) {
            //assert.equal(null, err1);
            //assert.equal(null, doc);
            //assert.equal(2, doc.b);
                setImmediate(function() {
                callback(err1,doc);
            });   
        db.close();
      });
        
        //db.close();
        })
    }
exports.findById=findById;
exports.modifyById=modifyById;
exports.save=saveToCollection;
exports.findByParam=findByParam;
