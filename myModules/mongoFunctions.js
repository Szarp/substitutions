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
		collection.find(paramAndValue,paramsToDisplay).toArray(function(e, doc) {
			if(doc){
				setImmediate(function() {
					callback(doc);
				});
			}
			else{
				setImmediate(function() {
					callback(null);
				});
			}
		});
		db.close();
	})
}

function saveToCollection(params,callback){
	var collectionName = params[0];
	var data = params[1];
	var url = 'mongodb://localhost:27017/test2';
	MongoClient.connect(url, function(err, db) {
		assert.equal(null,err);
		var collection=db.collection(collectionName);
		collection.insert(data, {w: 1}, function(err1, records){
			assert.equal(null,err1);
		});
		setImmediate(function() {
			callback();
		});
		db.close();
	})
}

function modifyById(id,collectionName,paramsToModify,callback){
	var data = paramsToModify;
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
				}
			});
		db.close();
	})
}

function findById(id,collectionName,callback){
	var url = 'mongodb://localhost:27017/test2';
	MongoClient.connect(url, function(err, db) {
		assert.equal(null,err);
		var collection=db.collection(collectionName);
		collection.findOne({_id:id},function(err1, doc) {
			setImmediate(function() {
				callback(err1,doc);
			});   
			db.close();
		});
	})
}

exports.findById=findById;
exports.modifyById=modifyById;
exports.save=saveToCollection;
exports.findByParam=findByParam;
