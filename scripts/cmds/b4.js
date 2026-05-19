const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "b4",
		version: "1.0",
		author: "siyam8881",
		countDown: 5,
		role: 1,
		shortDescription: "sarcasm",
		longDescription: "Responds with random media when someone says b4",
		category: "reply",
	},

	onStart: async function () {},

	onChat: async function ({ event, message }) {
		if (event.body && event.body.toLowerCase() === "b4") {

			const mediaLinks = [
				"https://drive.google.com/uc?id=1ZghCxVAkWIyxt8DGTVm6idAlzeGTeCWQ",
				"https://drive.google.com/uc?id=1Lm5QWv441bmrehKW4vN6iwE2RRzgFwua",
				"https://drive.google.com/uc?id=1-g5-_nU-B-Rx9d02gY1a0zbIVcv3mY6a",
				"https://drive.google.com/uc?id=143smxQ4a72oWxUSX9yep0ah_2xIO4spP",
				"https://drive.google.com/uc?id=1TIlvb8jUs6YWU1IVq73Qu8NJrVnfbR72",
				"https://drive.google.com/uc?id=18aXL1_Ac_Vpno2CtHh0KyUjflIFK5EQr",
        "https://drive.google.com/uc?id=1QEuJASzsSM1G6QtRfvRbMjfXRmY85GKS",
				"https://drive.google.com/uc?id=1b2ECofyIUScMPTb1H9POt5KuGyIM81ta",
				"https://drive.google.com/uc?id=1vflMZgytaaLvAxRWPmckPKhYtjzV_tlr",
				"https://drive.google.com/uc?id=16wHxey6t2xUI_dg_0fiOviQSF84fng-i",
				"https://drive.google.com/uc?id=1WA6cP4iumJE--1bUKD3G81GGLnN0HdyD",
				"https://drive.google.com/uc?id=1hnxO2s0gwrXJmXx6gkky0Olt08pWWyCr",
				"https://drive.google.com/uc?id=1fFNV9TyLyPsCzqSS7HgOPurHwu69IqxX",
				"https://drive.google.com/uc?id=1EHEoUnsccLX07jX84-AZEojRbr6HkeMp"
			];

			const randomLink = mediaLinks[Math.floor(Math.random() * mediaLinks.length)];
			const filePath = path.join(__dirname, "b4.mp4");

			try {
				const response = await axios.get(randomLink, {
					responseType: "arraybuffer"
				});

				fs.writeFileSync(filePath, response.data);

				await message.reply({
					body: "-!X-z⁶²M?\n\n々𝗪͜͡𝗛𝗢 -? 🎭👑\n\n\n\n- 々—͟͞͞Mʀ⸙𝙋𝙍𝙄𝙉𝘾𝙀 𝗩𝗜𝗥𝗨𝗦🚩🏴‍☠️📨\n\n____________☠️⚡",
					attachment: fs.createReadStream(filePath)
				});

			} catch (err) {
				console.error("Failed to fetch media:", err.message);
				await message.reply("Sorry, couldn't load the media.");
			} finally {
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				}
			}
		}
	}
};
