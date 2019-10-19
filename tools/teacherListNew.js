/* eslint-disable no-console */
const request = require("request");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

/**
 * Decode &nbsp; to space and remove double saces
 * @param {string} name name to parse
 */
function parseName(name) {
	return name.replace("&nbsp;", " ").replace(/ {2,}/, " ").trim();
}

/**
 * Returns a Map `short => full` name and Set with all full names
 * @param {string} data Raw HTML data
 */
function parse(data) {
	let tableData = /<table border="0" cellspacing="0px" cellpadding="3px" class="standard">([\w\W]*?)<\/table>/.exec(data)[1];
	const extractionRegExp = /<tr class='row[12]'>.*?<td><b>(.+?)<\/b><\/td> <td>(.*?)<\/td>/g;
	/** @type {Map<string, string>} */
	let mappedNames = new Map();
	/** @type {Set<string>} */
	let allNames = new Set();
	/** @type {RegExpExecArray} */
	let arr1;
	while ((arr1 = extractionRegExp.exec(tableData))) {
		let [, fullName, shortName] = arr1;
		fullName = parseName(fullName);
		shortName = parseName(shortName);
		if (shortName != "") {
			mappedNames.set(shortName, fullName);
		}
		if (fullName != "") {
			allNames.add(fullName);
		}
	}
	return { mappedNames, allNames };
}

/**
 * Update users' notification settings
 * @param {Object} param0
 * @param {Map<string, string>} param0.mappedNames
 */
async function updateNotificationSetting({ mappedNames }) {
	try {
		const client = await MongoClient.connect("mongodb://localhost:27017/");
		const collection = client.db("ZSO11").collection("person");
		/** @type {Promise<mongodb.UpdateWriteOpResult | void>[]} */
		let updateArray = [];
		let cursor = collection.find({ "personal.settings.setTeacher": { $exists: true, $ne: "---" } }).project({ "personal.settings.setTeacher": 1 });
		await cursor.forEach((doc) => {
			if (mappedNames.has(doc.personal.settings.setTeacher)) {
				let updatedName = mappedNames.get(doc.personal.settings.setTeacher);
				updateArray.push(collection.updateOne({ _id: doc._id }, { $set: { "personal.settings.setTeacher": updatedName } }));
			} else {
				console.warn("No replacement value was found for:", doc.personal.settings.setTeacher);
			}
		});
		await Promise.all(updateArray);
		await client.close();
		console.log("Updated notification settings");
	} catch (e) {
		console.error("Updating notifications settings failed with error:", e);
	}
}

/**
 * Update teachers list in db.
 * @param {Object} param0
 * @param {Set<string>} param0.allNames
 */
async function updateTeachersList({ allNames }) {
	try {
		const client = await MongoClient.connect("mongodb://localhost:27017/");
		const collection = client.db("ZSO11").collection("teachers");
		await collection.findOneAndReplace({ _id: "all" }, { teachers: [...allNames] });
		await client.close();
		console.log("Updated teachers list");
	} catch (e) {
		console.error("Updating teachers list failed:", e);
	}
}

request("https://zso11.edupage.org/teachers/", (err, resp) => {
	if (!err && resp.statusCode === 200 && resp.body) {
		let parsedData = parse(resp.body);
		Promise.all([updateTeachersList(parsedData), updateNotificationSetting(parsedData)])
			.then(() => {
				console.log("Done!");
			});
	} else {
		console.error(err || resp);
	}
});
