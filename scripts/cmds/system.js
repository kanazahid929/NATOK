 module.exports = {
	config: {
		name: "system",
		aliases: ["badword", "badwords"],
		version: "2.1",
		author: "siyamxxxx72",
		countDown: 5,
		role: 1,
		description: {
			en: "siyamBadwordsSystem"
		},
		category: "box chat",
		guide: {
			en: "   {pn} add <words>: add banned words"
				+ "\n   {pn} delete <words>: delete banned words"
				+ "\n   {pn} list: show banned words list"
				+ "\n   {pn} unwarn [<userID> | <@tag>]: remove warning"
				+ "\n   {pn} on: turn on warning"
				+ "\n   {pn} off: turn off warning"
		}
	},

	langs: {
		en: {
			onText: "on",
			offText: "off",
			onlyAdmin: "⚠️ | Only admins can add banned words to the list",
			missingWords: "⚠️ | You haven't entered the banned words",
			addedSuccess: "✅ | Added %1 banned words to the list",
			alreadyExist: "❌ | %1 banned words already exist in the list: %2",
			onlyAdmin2: "⚠️ | Only admins can delete banned words",
			missingWords2: "⚠️ | You haven't entered the words to delete",
			deletedSuccess: "✅ | Deleted %1 banned words from the list",
			notExist: "❌ | %1 banned words do not exist: %2",
			emptyList: "⚠️ | Banned words list is currently empty",
			badWordsList: "📑 | Banned words in your group: %1",
			onlyAdmin3: "⚠️ | Only admins can %1 this feature",
			turnedOnOrOff: "✅ | Banned words system has been %1",
			onlyAdmin4: "⚠️ | Only admins can delete warning",
			missingTarget: "⚠️ | You haven't entered user ID or tagged user",
			notWarned: "⚠️ | User %1 has not been warned",
			needAdmin: "Bot needs admin privileges to kick members",
			unwarned: "✅ | Removed warning of user %1 | %2"
		}
	},

	onStart: async function ({ message, event, args, threadsData, usersData, role, getLang }) {
		if (!await threadsData.get(event.threadID, "data.badWords"))
			await threadsData.set(event.threadID, {
				words: [],
				violationUsers: {}
			}, "data.badWords");

		const siyamBadWords = await threadsData.get(event.threadID, "data.badWords.words", []);

		switch (args[0]) {
			case "add": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin"));
				const siyamWords = args.slice(1).join(" ").split(/[,|]/);
				if (siyamWords.length === 0 || !args[1])
					return message.reply(getLang("missingWords"));
				const siyamExist = [];
				const siyamSuccess = [];
				for (const siyamWord of siyamWords) {
					const siyamClean = siyamWord.trim();
					if (!siyamClean) continue;
					const siyamOldIndex = siyamBadWords.indexOf(siyamClean);
					if (siyamOldIndex === -1) {
						siyamBadWords.push(siyamClean);
						siyamSuccess.push(siyamClean);
					}
					else {
						siyamExist.push(siyamClean);
					}
				}
				await threadsData.set(event.threadID, siyamBadWords, "data.badWords.words");
				message.reply(
					(siyamSuccess.length > 0 ? getLang("addedSuccess", siyamSuccess.length) : "")
					+ (siyamExist.length > 0 ? getLang("alreadyExist", siyamExist.length, siyamExist.join(", ")) : "")
				);
				break;
			}
			case "delete":
			case "del":
			case "-d": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin2"));
				const siyamWords = args.slice(1).join(" ").split(/[,|]/);
				if (siyamWords.length === 0 || !args[1])
					return message.reply(getLang("missingWords2"));
				const siyamSuccess = [];
				const siyamFailed = [];
				for (const siyamWord of siyamWords) {
					const siyamClean = siyamWord.trim();
					const siyamOldIndex = siyamBadWords.indexOf(siyamClean);
					if (siyamOldIndex > -1) {
						siyamBadWords.splice(siyamOldIndex, 1);
						siyamSuccess.push(siyamClean);
					}
					else {
						siyamFailed.push(siyamClean);
					}
				}
				await threadsData.set(event.threadID, siyamBadWords, "data.badWords.words");
				message.reply(
					(siyamSuccess.length > 0 ? getLang("deletedSuccess", siyamSuccess.length) : "")
					+ (siyamFailed.length > 0 ? getLang("notExist", siyamFailed.length, siyamFailed.join(", ")) : "")
				);
				break;
			}
			case "list":
			case "all":
			case "-a": {
				if (siyamBadWords.length === 0)
					return message.reply(getLang("emptyList"));
				message.reply(getLang("badWordsList", siyamBadWords.join(", ")));
				break;
			}
			case "on": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin3", getLang("onText")));
				await threadsData.set(event.threadID, true, "settings.badWords");
				message.reply(getLang("turnedOnOrOff", getLang("onText")));
				break;
			}
			case "off": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin3", getLang("offText")));
				await threadsData.set(event.threadID, false, "settings.badWords");
				message.reply(getLang("turnedOnOrOff", getLang("offText")));
				break;
			}
			case "unwarn": {
				if (role < 1)
					return message.reply(getLang("onlyAdmin4"));
				let siyamUserID;
				if (Object.keys(event.mentions)[0])
					siyamUserID = Object.keys(event.mentions)[0];
				else if (args[1])
					siyamUserID = args[1];
				else if (event.messageReply)
					siyamUserID = event.messageReply.senderID;
				if (isNaN(siyamUserID))
					return message.reply(getLang("missingTarget"));
				const siyamViolationUsers = await threadsData.get(event.threadID, "data.badWords.violationUsers", {});
				if (!siyamViolationUsers[siyamUserID])
					return message.reply(getLang("notWarned", siyamUserID));
				siyamViolationUsers[siyamUserID]--;
				await threadsData.set(event.threadID, siyamViolationUsers, "data.badWords.violationUsers");
				const siyamUserName = await usersData.getName(siyamUserID);
				message.reply(getLang("unwarned", siyamUserID, siyamUserName));
			}
		}
	},

	onChat: async function ({ message, event, api, threadsData, prefix, getLang }) {
		if (!event.body)
			return;
		const siyamThreadData = global.db.allThreadData.find(t => t.threadID === event.threadID) || await threadsData.create(event.threadID);
		const siyamIsEnabled = siyamThreadData.settings.badWords;
		if (!siyamIsEnabled)
			return;

		const siyamAllAliases = ["system", "badword", "badwords"];
		const siyamIsCommand = siyamAllAliases.some(a => event.body.startsWith(prefix + a));
		if (siyamIsCommand)
			return;

		const siyamBadWordList = siyamThreadData.data.badWords?.words;
		if (!siyamBadWordList || siyamBadWordList.length === 0)
			return;

		const siyamViolationUsers = siyamThreadData.data.badWords?.violationUsers || {};

		const axios = require("axios");
		const fs = require("fs-extra");
		const path = require("path");

		for (const siyamWord of siyamBadWordList) {
			if (event.body.match(new RegExp(`\\b${siyamWord}\\b`, "gi"))) {
				
				const siyamWarnImgUrl = "https://drive.google.com/uc?export=download&id=1ixMnOIyEKVpQNpnACRrRMMuI3kFlBzY6"; 
				const siyamImgPath = path.join(__dirname, "cache", "siyam_warn.jpg");

				let siyamAttachment = [];
				try {
					const siyamImgData = (await axios.get(siyamWarnImgUrl, { responseType: "arraybuffer" })).data;
					fs.writeFileSync(siyamImgPath, Buffer.from(siyamImgData, "utf-8"));
					siyamAttachment.push(fs.createReadStream(siyamImgPath));
				} catch (e) {}

				const siyamBanglaWarnMsg = `কিরে বলদা খারাপ কথা বললি কেন‌?🙄 \nপ্রথমবার তোকে warnning 🍷🚩 দিলাম \nযদি আর একবার খারাপ কথা বলিস💀🚩 সোজা ঘাড় ধাক্কা দিয়ে গ্রুপ থেকে বের করে দিব 🕷️🕸️⛳`;

				if ((siyamViolationUsers[event.senderID] || 0) < 1) {
					message.reply({
						body: siyamBanglaWarnMsg,
						attachment: siyamAttachment
					});
					siyamViolationUsers[event.senderID] = siyamViolationUsers[event.senderID] ? siyamViolationUsers[event.senderID] + 1 : 1;
					await threadsData.set(event.threadID, siyamViolationUsers, "data.badWords.violationUsers");
					return;
				}
				else {
					await message.reply({
						body: `⚠️ | ২য় বার খারাপ কথা বলার কারণে তোকে গ্রুপ থেকে কিক মারা হলো!`,
						attachment: siyamAttachment
					});
					api.removeUserFromGroup(event.senderID, event.threadID, (siyamErr) => {
						if (siyamErr)
							return message.reply(getLang("needAdmin"));
					});
				}
			}
		}
	}
};
