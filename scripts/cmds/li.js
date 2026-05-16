 const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "li",
    aliases: ["listgroup", "lgroups", "lg"],
    version: "6.2",
    author: "siyam",
    countDown: 5,
    role: 2,
    shortDescription: "List groups with custom image, leave/add by reply",
    longDescription: "Reply 1,2 to leave, 1 add to add yourself. Failed messages hidden. No prefix supported",
    category: "owner",
    guide: "{p}li or just type 'li'"
  },

  onStart: async function ({ api, event }) {
    try {
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      const groups = threadList.filter(t => t.isGroup);

      let activeGroups = [];
      for (const g of groups) {
        try {
          const info = await api.getThreadInfo(g.threadID);
          if (info.participantIDs.includes(api.getCurrentUserID())) {
            activeGroups.push({
              name: info.threadName || "No Name",
              threadID: g.threadID,
              members: info.participantIDs.length
            });
          }
        } catch {}
      }

      if (activeGroups.length === 0)
        return api.sendMessage("❌ Bot is not in any group.", event.threadID);

      let msg = "📋 Bot Active Groups:\n\n";
      activeGroups.forEach((g, i) => {
        msg += `${i + 1}. ${g.name}\n`;
        msg += `   🆔 TID: ${g.threadID}\n`;
        msg += `   👥 Members: ${g.members}\n\n`;
      });

      msg +=
        "👉 Reply options:\n" +
        "• 1,2 → Leave groups\n" +
        "• 1 add → Add yourself (failed messages hidden)";

      // 🔥 External image URL
      const imageUrl = "https://files.catbox.moe/e3bb3v.jpg";
      const imagePath = path.resolve(__dirname, "temp_image.jpg");

      // Download image
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imagePath, Buffer.from(response.data, "utf-8"));

      api.sendMessage(
        { body: msg, attachment: fs.createReadStream(imagePath) },
        event.threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "li",
            author: event.senderID,
            groups: activeGroups
          });
          // Delete temp image after sending
          setTimeout(() => fs.unlinkSync(imagePath), 5000);
        }
      );

    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Error loading group list.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author)
      return api.sendMessage("❌ This command is not for you.", event.threadID);

    const text = event.body.trim().toLowerCase();

    // 🔥 ADD SYSTEM (Failed hidden)
    if (text.includes("add")) {
      const index = parseInt(text.replace("add", "").trim()) - 1;
      if (isNaN(index) || index < 0 || index >= Reply.groups.length) return;

      const g = Reply.groups[index];
      try {
        await api.addUserToGroup(event.senderID, g.threadID);
        return api.sendMessage(`✅ Add request sent / Added to: ${g.name}`, event.threadID);
      } catch { return; } // failed hidden
    }

    // 🔥 LEAVE SYSTEM (Failed hidden)
    const indexes = text.split(/[, ]+/).map(n => parseInt(n) - 1).filter(i => !isNaN(i));
    if (indexes.length > 0) {
      let result = [];
      for (const i of indexes) {
        if (i < 0 || i >= Reply.groups.length) continue;
        const g = Reply.groups[i];
        try {
          await api.removeUserFromGroup(api.getCurrentUserID(), g.threadID);
          result.push(`✅ Left: ${g.name}`);
        } catch { continue; } // failed hidden
      }
      if (result.length > 0) return api.sendMessage(result.join("\n"), event.threadID);
    }
  },

  onChat: async function ({ api, event }) {
    if (!event.body) return;
    const text = event.body.trim().toLowerCase();
    if (text === "li") return this.onStart({ api, event });

    if (event.messageReply) {
      const Reply = global.GoatBot.onReply.get(event.messageReply.messageID);
      if (Reply && Reply.commandName === "li") {
        return this.onReply({ api, event, Reply });
      }
    }
  }
};
