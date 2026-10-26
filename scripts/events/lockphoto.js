const fs = require("fs-extra");
const path = require("path");

const DB = path.join(process.cwd(), "lockphoto-data.json");
!event install lockphoto.js
module.exports = {
	config: {
		name: "lockphoto",
		version: "1.0.0",
		author: "Prince",
		description: "Restore locked group photo",
		category: "events"
	},

	onStart: async function ({ api, event }) {
		if (event.logMessageType !== "log:thread-image")
			return;

		const id = event.threadID;

		try {
			if (!await fs.pathExists(DB)) return;
			const data = await fs.readJson(DB);
			const lock = data[id];

			if (!lock || !lock.enabled || !lock.imagePath)
				return;

			const actor = String(event.author || event.senderID || "");
			if (!actor) return;

			if (actor === String(api.getCurrentUserID())) return;

			const info = await new Promise((resolve, reject) =>
				api.getThreadInfo(id, (err, res) => err ? reject(err) : resolve(res))
			);

			const admins = (info.adminIDs || []).map(x =>
				String(x.id || x.userID || x)
			);
			const botAdmins = (global.GoatBot.config.adminBot || []).map(String);

			if (admins.includes(actor) || botAdmins.includes(actor))
				return;

			if (typeof api.changeGroupImage !== "function")
				return console.error("changeGroupImage API নেই");

			await api.changeGroupImage(
				fs.createReadStream(lock.imagePath), id
			);

			api.sendMessage(
				"⚠️ Warning: অনুমতি ছাড়া গ্রুপের ছবি পরিবর্তন করা হয়েছে। আগের ছবি ফেরানোর চেষ্টা করা হয়েছে।",
				id
			);
		} catch (err) {
			console.error("lockphoto event:", err);
		}
	}
};
