const fs = require("fs");

module.exports = {
    config: {
        name: "npx4",
        version: "1.0",
        author: "siyam1",
        countDown: 5,
        role: 0,
        description: {
            en: "Auto play audio when trigger emojis are detected"
        },
        category: "no prefix",
        guide: {
            en: "Only trigger emoji will send voice"
        }
    },

    onChat: async function ({ api, event }) {
        const { threadID, messageID, body } = event;
        if (!body) return;

        // Strip spaces from message
        const text = body.replace(/\s+/g, "");

        // Trigger emojis
        const triggers = ["💔", "😔", "😭"];

        // Check if the whole message is exactly one of the triggers
        if (triggers.includes(text)) {

            const filePath = __dirname + "/siyam/broken.mp3";

            api.sendMessage({
                body: "😻🍭𝐂𝐄𝐎⸙𝗣͜͡𝗿𝗶𝗻𝗰𝗲𓆪🍥🧸",
                attachment: fs.createReadStream(filePath)
            }, threadID, messageID);

            api.setMessageReaction("😽", messageID, () => {}, true);
        }
    },

    onStart: async function () {}
};
