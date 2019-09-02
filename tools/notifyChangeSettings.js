const { MongoClient } = require("mongodb");
const config = require("../myModules/config.js");
const messFunc = require("../myModules/messFunctions.js");
const messSender = new messFunc.send(config.pageToken);

const client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true, useUnifiedTopology: true });
client.connect()
	.then(clientt => {
		const collection = clientt.db(config.db).collection("person");
		const query = { $and: [{ "personal.settings.notification": "yes" }, { "personal.settings.setClass": { $ne: "" } }, { "personal.settings.setClass": { $ne: "no" } }] };
		return collection.find(query).toArray();
	})
	.then(users => {
		for (const user of users) {
			messFunc.preapreMessage("text", user.personal.id, "Wszystkim osobom korzystającym z bota przypominamy o konieczności zmiany klasy w ustawieniach na stronie.\nŻyczymy udanego roku szkolnego\n\nAdministratorzy bota 🤖", (message) => {
				messSender.send(message);
			});
		}
	})
	.catch(err => console.error(err))
	.finally(() => client.close());
