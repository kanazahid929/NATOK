const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const DB = path.join(process.cwd(), "lockphoto-data.json");
const DIR = path.join(process.cwd(), "lockphoto-images");

module.exports = {
	config: {
		name: "lockphoto",
		version: "1.0.0",
		author: "Prince",
		countDown: 5,
		role: 1,
		description: { en: "Lock group photo" },
		category: "box chat",
		guide: { en: "{pn} on/off" }
	},

	onStart: async function ({ api, event, args, message }) {
		const id = event.threadID;
		const action = (args[0] || "").toLowerCase();

		if (!["on", "off"].includes(action))
			return message.reply("ব্যবহার: !lockphoto on অথবা !lockphoto off");

		try {
			const data = await fs.pathExists(DB) ? await fs.readJson(DB) : {};

			if (action === "off") {
				if (data[id]) data[id].enabled = false;
				await fs.writeJson(DB, data, { spaces: 2 });
				return message.reply("🔓 Photo lock বন্ধ!");
			}

			const info = await new Promise((resolve, reject) =>
				api.getThreadInfo(id, (err, res) => err ? reject(err) : resolve(res))
			);

			if (!info.imageSrc)
				return message.reply("❌ বর্তমান গ্রুপ ছবির লিংক পাওয়া যায়নি।");

			await fs.ensureDir(DIR);
			const imagePath = path.join(DIR, `${id}.jpg`);
			const res = await axios.get(info.imageSrc, {
				responseType: "arraybuffer",
				timeout: 20000
			});
			await fs.writeFile(imagePath, res.data);

			data[id] = { enabled: true, imagePath };
			await fs.writeJson(DB, data, { spaces: 2 });

			return message.reply("🔒 Photo lock চালু! আগের ছবি সংরক্ষণ করা হয়েছে।");
		} catch (err) {
			console.error(err);
			return message.reply("❌ ছবি সংরক্ষণ করা যায়নি।");
		}
	}
};
