module.exports = {
  config: {
    name: "pd",
    version: "1.1.0",
    author: "Prince",
    countDown: 3,
    role: 0,
    description: {
      en: "List pending members (Bot Admin only)"
    },
    category: "box chat"
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    try {
      // Get existing Goat Bot V2 Bot Admin list
      const botConfig = global.GoatBot?.config || {};
      const adminBot = botConfig.adminBot || [];
      const senderID = String(event.senderID);

      // Allow only Bot Admins
      const isBotAdmin = adminBot.some(
        id => String(id) === senderID
      );

      if (!isBotAdmin) {
        return api.sendMessage(
          "❌ এই CMD শুধু আমার আদিল বস ব্যবহার করতে পারবে।",
          threadID
        );
      }

      const info = await api.getThreadInfo(threadID);
      const queue = info.approvalQueue;

      if (!Array.isArray(queue) || queue.length === 0) {
        return api.sendMessage(
          "⏳ আদিল বস কোনো pending member পাওয়া যায়নি।",
          threadID
        );
      }

      const ids = queue.map(u =>
        String(u.requesterID || u.userID || u.id || "")
      ).filter(Boolean);

      const users = await api.getUserInfo(ids);

      const lines = await Promise.all(
        queue.map(async (u, i) => {
          const id = String(
            u.requesterID || u.userID || u.id || "ID নেই"
          );

          const user = Array.isArray(users)
            ? users.find(x =>
                String(x.id || x.userID) === id
              ) || {}
            : (users[id] || {});

          let name =
            u.fullName ||
            u.name ||
            user.name ||
            user.fullName;

          if (!name || name === "undefined") {
            name = "নাম পাওয়া যায়নি";
          }

          return `${i + 1}. ${name}\nID: ${id}`;
        })
      );

      return api.sendMessage(
        `⏳ PENDING MEMBERS: ${queue.length}\n\n${lines.join("\n\n")}`,
        threadID
      );

    } catch (err) {
      console.error("pd command error:", err);

      return api.sendMessage(
        `❌ আদিল বস  Pending list আনতে সমস্যা হয়েছে।\n${err.message}`,
        threadID
      );
    }
  }
};
