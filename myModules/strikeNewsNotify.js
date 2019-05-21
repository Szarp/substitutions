const request = require("request");
const { MongoClient } = require("mongodb");
const { db: dbName, pageToken, adm2: adminId } = require("./config");
const htmlDecoder = require("./util_HTMLCharDecoder");

const dbURL = "mongodb://localhost:27017";
const postsURL = "https://www.zso11.zabrze.pl/wp-json/wp/v2/posts/?per_page=3&after=2019-04-05T16:00:00";
//const previousStatusURL = "https://www.zso11.zabrze.pl/wp-json/wp/v2/posts/4505";

function makeAPIRequest(url) {
	return new Promise((resolve, reject) => {
		request(url, { json: true, gzip: true }, (err, _res, body) => {
			if (err) {
				reject(err);
			} else if (!body) {
				reject("No body received!");
			} else {
				resolve(body);
			}
		});
	});
}

async function getSavedPost(postId) {
	let client;
	try {
		client = await MongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
		const collection = client.db(dbName).collection("school_posts");
		const document = await collection.findOne({ postId });
		client.close();
		return document;
	} catch (err) {
		if (client && client.isConnected()) client.close();
		throw err;
	}
}

async function subscribedUsersList() {
	let client;
	try {
		client = await MongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
		const collection = client.db(dbName).collection("person");
		const documents = await collection.find({ "system.connected": true, "personal.settings.notification": "yes", "personal.settings.setClass": { $ne: "" } }).project({ "personal.id": 1 }).toArray();
		client.close();
		let userSet = new Set();
		for (const doc of documents) {
			if (doc.personal && doc.personal.id) userSet.add(doc.personal.id);
		}
		return userSet;
	} catch (err) {
		if (client && client.isConnected()) client.close();
		throw err;
	}
}

async function messagedSinceMigration() {
	let client;
	try {
		client = await MongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
		const collection = client.db(dbName).collection("userMessages");
		const documents = collection.find({ "timestamp": { $gte: 1552859279499 } }).project({ "sender": 1 }).toArray();
		const collection2 = client.db(dbName).collection("serverMessages");
		const documents2 = collection2.find({ "timestamp": { $gte: 1552859324879 } }).project({ "sender": 1 }).toArray();
		await Promise.all([documents, documents2]);
		client.close();
		let userSet = new Set();
		for (const doc of await documents) {
			if (doc.sender) userSet.add(doc.sender);
		}
		for (const doc of await documents2) {
			if (doc.sender) userSet.add(doc.sender);
		}
		return userSet;
	} catch (err) {
		if (client && client.isConnected()) client.close();
		throw err;
	}
}

async function finalUserList() {
	try {
		let subscribed = subscribedUsersList();
		let messaged = messagedSinceMigration();
		return new Set([...await subscribed, ...await messaged]);
	} catch (err) {
		throw (err);
	}
}

async function savePost(postData) {
	let client;
	try {
		client = await MongoClient.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
		const collection = client.db(dbName).collection("school_posts");
		collection.findOneAndUpdate({ postId: postData.id }, { $set: postData }, { upsert: true });
		client.close();
		return;
	} catch (err) {
		if (client && client.isConnected()) client.close();
		throw err;
	}
}

function checkUpdate(newPost, savedPost) {
	let modificationDate = new Date(newPost.modified);
	let savedModificationDate = new Date(savedPost);
	if (modificationDate > savedModificationDate && prepareMessageText(newPost) !== prepareMessageText(savedPost)) return true;
	return false;
}

function prepareMessageText(postData, wasModified = false) {
	if (!(postData.title && postData.title.rendered)) throw new Error("The post has no title!");
	let title = postData.title.rendered;
	if (!(postData.excerpt && postData.excerpt.rendered)) throw new Error("The post has no excerpt!");
	let content = postData.excerpt.rendered;
	let ellipsis = false;
	if (content.indexOf("&hellip; <a") !== -1) {
		if (!(postData.content && postData.content.rendered)) throw new Error("The post has no content!");
		let fullText = htmlDecoder(postData.content.rendered.replace(/<\/?.*?>/g, "")).trim();
		if (fullText.length < 1700) {
			// If the excerpt doesn't contain the full text and the text is shorter than 1700 chars (message limit = 2000)
			// replace the excerpt with full post content
			content = fullText;
		} else {
			content = content.substring(0, content.indexOf("&hellip; <a")).replace(/<\/?.*?>/g, "").trim();
			ellipsis = true;
		}
	} else {
		content = content.replace(/<\/?.*?>/g, "").trim();
	}
	return `PILNE! ${wasModified ? "Zmieniona" : "Nowa"} wiadomość nt. strajku!\nTytuł: *${title}*\n\n${content}${ellipsis ? " (…)" : ""}`;
}

function linkToPost(postData) {
	if (!postData || !postData.link) throw new Error("No link to post!");
	return postData.link;
}

/**
 * @typedef buttonPrepare Single button details
 * @property {"web_url" | "postback"} type Button type
 * @property {string} payload URL or payload for postback
 * @property {string} title Button title (what user can see)
 */
/**
 * @typedef buttonReady Single button details
 * @property {"web_url" | "postback"} type Button type
 * @property {string} [payload] Payload for postback (if type of button is postback)
 * @property {string} [url] URL for button (if button type is web_url)
 * @property {string} title Button title (what user can see)
 */
/**
 * Prepare buttons for message
 * @param {buttonPrepare[]} buttonArray Array of button details
 * @returns {buttonReady[]}
 */
function prepareButtons(buttonArray) {
	let buttons = [];
	for (const buttonDetails of buttonArray) {
		let singleButton = { type: buttonDetails.type, title: buttonDetails.title };
		if (buttonDetails.type === "web_url") singleButton.url = buttonDetails.payload;
		if (buttonDetails.type === "postback") singleButton.payload = buttonDetails.payload;
		buttons.push(singleButton);
	}
	return buttons;
}

function callSendAPI(messageData) {
	request({
		uri: "https://graph.facebook.com/v2.9/me/messages",
		qs: { access_token: pageToken },
		method: "POST",
		json: messageData
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			if (response && response.statusCode) console.error("Status code:", response.statusCode);
			if (response && response.body) console.error("Response body:", response.body);
			console.error(error);
		}
	});
}

function prepareMessagesAndSend(users, postData, wasModified = false) {
	try {
		let buttons = prepareButtons([{ type: "web_url", payload: linkToPost(postData), title: "Przeczytaj" }]);
		let text = prepareMessageText(postData, wasModified);
		let messageTemplate = {
			recipient: {
				id: ""
			},
			message: {
				attachment: {
					type: "template",
					payload: {
						template_type: "button",
						text: text,
						buttons: buttons
					}
				}
			}
		};
		for (const userId of users) {
			messageTemplate.recipient.id = userId;
			callSendAPI(messageTemplate);
		}
		return;
	} catch (e) {
		throw e;
	}
}

async function checkForNewOrUpdated(postsArray) {
	try {
		if (postsArray && postsArray instanceof Array && postsArray.length > 0) {
			for (let post of postsArray) {
				let { id } = post;
				if (!id) throw new Error("Post id is empty/undefined");
				let savedVersion = await getSavedPost(id);
				if (savedVersion && savedVersion.modified) {
					// If previous post was modified
					if (checkUpdate(post, savedVersion)) {
						let usersList = finalUserList();
						if (post._links) delete post._links;
						savePost(post);
						//SEND NOTIFICATION
						prepareMessagesAndSend(await usersList, post, true);
					}
				} else if (!savedVersion && id == 4505) {
					// Known previous status post. Don't notify about it if it isn't modified
					if (post._links) delete post._links;
					savePost(post);
				} else if (!savedVersion && ((post.content && post.content.rendered && /strajk/i.test(post.content.rendered)) || post.title && post.title.rendered && /strajk/i.test(post.title.rendered))) {
					// A new post constaining string "strajk" (case insensitive); Save it and notify users
					let usersList = finalUserList();
					if (post._links) delete post._links;
					savePost(post);
					//SEND NOTIFICATION
					prepareMessagesAndSend(await usersList, post);
				}
			}
		}
	} catch (err) {
		throw err;
	}
}

async function updateData() {
	try {
		const postArr = makeAPIRequest(postsURL);
		checkForNewOrUpdated(await postArr);
	} catch (error) {
		try {
			callSendAPI({
				recipient: {
					id: adminId
				},
				message: {
					text: `Error ${error.name || error}: ${error.message || "There's no message provided"}\nStack:\n${error.stack || "No stack for this error"}`
				}
			});
		} catch (err) {
			console.error("Couldn't notify admin about error", err);
		}
		console.error(error);
	}
}

module.exports = updateData;
