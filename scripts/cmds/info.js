 const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    author: "Tokodori",
    role: 0,
    shortDescription: "Displays admin info",
    longDescription: "Shows info about the bot owner/admin",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async () => {},

  onChat: async function ({ api, event }) {
    try {
      if (!event.body || event.body.toLowerCase() !== "info") return;

      const videoUrl = "https://drive.google.com/uc?id=1Ra5iFE1XiIcuQfttp1luHxgMPbiwVYYZ";
      const videoPath = path.join(__dirname, "info.mp4");

      const response = await axios.get(videoUrl, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(videoPath, response.data);

      const message = `
╭─━━━❖🫧❖━━━─╮
👾 𝗩͟𝗜͟͠𝗥𝗨𝗦  𝗔͟𝗟͟͠𝗘𝗥𝗧
╰─━━━❖🫧❖━━━─╯

- 𝗡𝗔͜͡𝗠𝗘       :    - 𝐏𝐑𝐈𝐍𝐂𝐄  🎭
- 𝗚𝗘͜͡𝗡𝗗𝗘𝗥        : -𝗠𝗔͜͡𝗟𝗘  ⚡
- 𝗥𝗘͜͡𝗟𝗔𝗧𝗜𝗢𝗡𝗦𝗛𝗜𝗣 :  - 𝗦𝗜͜͡𝗡𝗚𝗟𝗘  🪄
🍷 𝗔͜͡𝗚𝗘            : 28  🥂
💝 𝗥𝗘͜͡𝗟𝗜𝗚𝗜𝗢𝗡 : 𝗜𝗦͜͡𝗟𝗔𝗠
𝗔͜͡𝗗𝗗𝗥𝗘𝗦𝗦       : CHANDPUR 🍷☠️
- 𝗙𝗔͜͡𝗖𝗘𝗕𝗢𝗢𝗞 : 🪄https://www.facebook.com/profile.php?id=61576321289131

🎯🪄⚡

👾 𝗧𝗜͜͡𝗧𝗟𝗘 : 𝗕𝗜𝗥𝗧𝗛 𝗙𝗔͜͡𝗧𝗛𝗘𝗥 𝗢𝗙 𝗡𝗢𝗕𝗜𝗡🍷
📩 𝗙𝗔͜͡𝗩𝗢𝗥𝗜𝗧𝗘 𝗪𝗢𝗥𝗗 : 𝗘𝗥𝗢͜͡𝗢𝗥 📨🥂
🎭 𝗠𝗢͜͡𝗗𝗘 : 𝗗𝗔𝗥𝗞 | 𝗛𝗜͜͡𝗗𝗗𝗘𝗡 | 𝗙𝗢𝗖𝗨𝗦𝗘𝗗 ☠️
🧠 𝗖𝗢͜͡𝗠𝗠𝗔𝗡𝗗𝗦 : 𝟰𝟰𝟰☠️
👑 𝗦𝗢͜͡𝗠𝗘𝗧𝗛𝗜𝗡𝗚 𝗘𝗟𝗦𝗘 : 🍷👑

───────────────────────────
`;

      await api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(videoPath)
        },
        event.threadID,
        event.messageID
      );

      api.setMessageReaction("🖤", event.messageID, () => {}, true);

      fs.unlinkSync(videoPath);

    } catch (e) {
      console.error(e);
      api.sendMessage("Something went wrong!", event.threadID);
    }
  }
};
