var MongoClient = require('mongodb').MongoClient,
    config = require('./config'),
    assert = require('assert');
/*
	Module to comunicate with mongo
*/
var url = setUrl(config.db);

function setUrl(db){
    url = "mongodb://localhost:27017/"+db;
    return url;
}
function findByParam(paramAndValue,paramsToDisplay,collectionName,callback){
	//var url = 'mongodb://localhost:27017/test2';
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
			db.close();
		});
	})
}

function saveToCollection(params,callback){
	var collectionName = params[0];
	var data = params[1];
	//var url = 'mongodb://localhost:27017/test2';
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
	//var url = 'mongodb://localhost:27017/test2';
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
					console.error(err.message);  // returns error if no matching object found
				}else{
					setImmediate(function() {
						callback();
					});
				}
			});
		db.close();
	})
}

async function modifyById2(id, collectionName, paramsToModify) {
	try {
		let client = await MongoClient.connect(url);
		let db = await client.db(config.db);
		let collection = await db.collection(collectionName);
		await collection.findOneAndUpdate({ _id: id }, { $set: paramsToModify }, { upsert: true });
		await client.close();
		return;
	} catch (e) {
		throw (e);
	}
}

function findById(id,collectionName,callback){
	//var url = 'mongodb://localhost:27017/test2';
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
exports.modifyById2=modifyById2;
exports.save=saveToCollection;
exports.findByParam=findByParam;
//exports.url = url;