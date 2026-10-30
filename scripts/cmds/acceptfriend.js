"use strict";

const fs = require("fs-extra");
const path = require("path");

const filePath = path.join(
  process.cwd(),
  "data",
  "friend-requests.json"
);

function getRequests() {
  fs.ensureDirSync(path.dirname(filePath));

  if (!fs.existsSync(filePath)) {
    fs.writeJsonSync(filePath, []);
  }

  return fs.readJsonSync(filePath);
}

module.exports = {
  config: {
    name: "af",
    version: "1.0.0",
    author: "Prince",
    role: 2,
    description: "View and accept saved friend requests",
    category: "Admin"
  },

  onStart: async function ({ message }) {
    const requests = getRequests();

    if (!requests.length) {
      return message.reply(
        "📭 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস কোনো সংরক্ষিত Friend Request পাওয়া যায়নি।"
      );
    }

    const list = requests.map((item, index) =>
      `${index + 1}. UID: ${item.uid}`
    ).join("\n");

    const sent = await message.reply(
      `📩 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 BOSS UR FRIEND REQUESTS\n\n${list}\n\𝗣͜͡𝗿𝗶𝗻𝗰𝗲n বস যে Request Accept করতে চাও, তার নম্বর Reply দাও।`
    );

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "af",
      author: message.senderID,
      requests
    });
  },

  onReply: async function ({ api, event, message, Reply }) {
    if (String(event.senderID) !== String(Reply.author)) {
      return;
    }

    const number = Number(event.body);

    if (
      !Number.isInteger(number) ||
      number < 1 ||
      number > Reply.requests.length
    ) {
      return message.reply("❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস সঠিক Request নম্বর দাও।");
    }

    const selected = Reply.requests[number - 1];

    try {
      await api.handleFriendRequest(selected.uid, true);

      const requests = getRequests().filter(
        item => item.uid !== selected.uid
      );

      fs.writeJsonSync(filePath, requests, {
        spaces: 2
      });

      return message.reply(
        `✅ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস  Friend Request Accept করা হয়েছে!\nUID: ${selected.uid}`
      );
    } catch (error) {
      return message.reply(
        `❌𝗣͜͡𝗿𝗶𝗻𝗰𝗲 Boss Accept করা যায়নি: ${error.message || error}`
      );
    }
  }
};
