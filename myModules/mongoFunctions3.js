const mongo = require("mongodb");
const { MongoClient } = mongo;
const config = require("./config");

const url = "mongodb://localhost:27017";
const dbName = config.db;

/**
 * Finds and returns all documents satysfying query.
 * @param {mongo.FilterQuery<any>} query Search query. Eg. `{_id: 123}` or `{date: {$gt: "2019"}}`
 * @param {Object.<string, 0 | 1>} paramsToDisplay Returned fields. Set `1` to include, `0` to hide. `0` and `1` can't be set at the same time. Eg. `{date: 1, name: 1, "settings.notification": 1}`
 * @param {string} collectionName Target collection
 * @param {mongo.MongoCallback<null | any[]>} callback Callback. First param is `null` or `MongoError`, second is `null` or an array of documents
 * @param {string} [userDbName=dbName] _Optional:_ use other db.
 *
 * @example
 * const mongo = require("./mongoFunctions3");
 * mongo.findByParam({date: {$gte: "2019-03"}}, {date: 1, "details.price": 1}, "someCollection", (err, doc) => {
 * 	if (err) {
 * 		// handle error
 * 	} else {
 * 		// do something with doc
 * 	}
 * });
 */
function findByParam(query, paramsToDisplay, collectionName, callback, userDbName = dbName) {
	const mongoClient = new MongoClient(url);
	mongoClient.connect((err, client) => {
		if (!err) {
			const collection = client.db(userDbName || dbName).collection(collectionName);
			collection.find(query).project(paramsToDisplay).toArray((err, result) => {
				callback(err, result);
				mongoClient.close();
			});
		} else {
			callback(err, null);
		}
	});
}

/**
 * Inserts a new document to selected collection
 * @param {[string, any]} param0 First element is collection name, the second one is the document to be inserted.
 * @param {mongo.MongoCallback<mongo.InsertOneWriteOpResult>} callback Called with error (or null) as the first parameter
 * @param {string} [userDbName=dbName] _Optional:_ use other db.
 *
 * @example
 * const mongo = require("./mongoFunctions3");
 * mongo.save(["someCollection", {_id: "docId", prop1: "b", d: ["a", 2]}], (err, result) => {
 * 	if (err) {
 * 		// handle error
 * 	} else {
 * 		// insertion successful; details in result parameter
 * 	}
 * });
 */
function saveToCollection([collectionName, data], callback, userDbName = dbName) {
	const mongoClient = new MongoClient(url);
	mongoClient.connect((err, client) => {
		if (!err) {
			const collection = client.db(userDbName || dbName).collection(collectionName);
			collection.insertOne(data, (err, result) => {
				callback(err, result);
				mongoClient.close();
			});
		} else {
			callback(err, null);
		}
	});
}

/**
 * Update document with given id in selected collection. If it doesn't exist a new document will be created.
 * @param {any} id Document id
 * @param {string} collectionName Collection name
 * @param {any} paramsToModify Parameters to modify. Eg. `{param1: "a", "param10.p2": b}`
 * @param {mongo.MongoCallback<mongo.FindAndModifyWriteOpResultObject<any>>} [callback] Callback. If not passed a promise is returned
 * @param {string} [userDbName=dbName] _Optional:_ use other db.
 * @returns {Promise<mongo.FindAndModifyWriteOpResultObject<any>>} returns Promise if no callback passed
 *
 * @example // Callback
 * const mongo = require("./mongoFunctions3");
 * mongo.modifyById("myId", "someCollection", {param1: "a", "param10.p2": b}, (err, result) => {
 * 	if (err) {
 * 		// handle error
 * 	} else {
 * 		// success, document updated - details in `result` parameter
 * 	}
 * });
 *
 * @example // Promise
 * const mongo = require("./mongoFunctions3");
 * mongo.modifyById("myId", "someCollection", {param1: "a", "param10.p2": b})
 * 	.then((result) => {
 * 		// success, document updated - details in `result` parameter
 * 	})
 * 	.catch((err) => {
 * 		// handle error
 * 	});
 */
function modifyById(id, collectionName, paramsToModify, callback, userDbName = dbName) {
	const mongoClient = new MongoClient(url);
	if (typeof callback === "function") {
		mongoClient.connect((err, client) => {
			if (!err) {
				const collection = client.db(userDbName || dbName).collection(collectionName);
				collection.findOneAndUpdate(
					{ _id: id },
					{ $set: paramsToModify }, // Update fields, do not replace object
					{ upsert: true }, // Create document if no document found with given id
					(err, result) => {
						callback(err, result);
						mongoClient.close();
					});
			} else {
				callback(err, null);
			}
		});
	} else {
		return new Promise((resolve, reject) => {
			if (typeof callback === "string") userDbName = callback;
			mongoClient.connect()
				.then(client => {
					const collection = client.db(userDbName || dbName).collection(collectionName);
					return collection.findOneAndUpdate({ _id: id }, { $set: paramsToModify }, { upsert: true });
				})
				.then(result => {
					mongoClient.close();
					resolve(result);
				})
				.catch(err => {
					if (mongoClient.isConnected()) mongoClient.close();
					reject(err);
				});
		});
	}
}

/**
 * Finds and returns **one** document with specified id from selected collection
 * @param {any} id Object id.
 * @param {string} collectionName Target collection
 * @param {mongo.MongoCallback<null | any>} callback Callback. First param is `null` or `MongoError`, second is `null` or a document
 * @param {string} [userDbName=dbName] _Optional:_ use other db.
 *
 * @example
 * const mongo = require("./mongoFunctions3");
 * mongo.findById("myId", "someCollection", (err, doc) => {
 * 	if (err) {
 * 		// handle error
 * 	} else {
 * 		// do something with doc
 * 	}
 * });
 */
function findById(id, collectionName, callback, userDbName = dbName) {
	const mongoClient = new MongoClient(url);
	mongoClient.connect((err, client) => {
		if (!err) {
			const collection = client.db(userDbName || dbName).collection(collectionName);
			collection.findOne({ _id: id }, (err, result) => {
				callback(err, result);
				mongoClient.close();
			});
		} else {
			callback(err, null);
		}
	});
}

module.exports.findByParam = findByParam;
module.exports.save = saveToCollection;
module.exports.modifyById = modifyById;
module.exports.findById = findById;
