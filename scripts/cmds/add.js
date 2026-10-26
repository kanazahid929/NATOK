module.exports = {
  config: {
    name: "add",
    version: "1.1.0",
    author: "Prince",
    countDown: 5,
    role: 0,
    description: {
      en: "Add a selected pending member to the group (Bot Admin only)"
    },
    category: "box chat",
    guide: {
      en: "{pn} 1 (reply to pending list)"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;

    // Check Goat Bot V2 Bot Admin list
    const botConfig = global.GoatBot?.config || {};
    const adminBot = botConfig.adminBot || [];
    const senderID = String(event.senderID);

    const isBotAdmin = adminBot.some(
      id => String(id) === senderID
    );

    // Only Bot Admin can use this command
    if (!isBotAdmin) {
      return api.sendMessage(
        "❌ এই CMD শুধু আমার আদিল বস ব্যবহার করতে পারবে।",
        threadID
      );
    }

    const reply = event.messageReply;

    if (!reply || !reply.body) {
      return api.sendMessage(
        "⚠️ Pending list-এর মেসেজে Reply দিয়ে !add 1 লিখো।",
        threadID
      );
    }

    const index = Number(args[0]);

    if (!Number.isInteger(index) || index < 1) {
      return api.sendMessage(
        "⚠️ সঠিক নম্বর দাও। যেমন: !add 1",
        threadID
      );
    }

    const lines = reply.body.split("\n");
    const members = [];

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^\s*(\d+)\.\s*(.+)$/);

      if (match && lines[i + 1]) {
        const idMatch = lines[i + 1].match(/ID:\s*(\d+)/);

        if (idMatch) {
          members[Number(match[1])] = {
            name: match[2].trim(),
            id: idMatch[1]
          };
        }
      }
    }

    const member = members[index];

    if (!member) {
      return api.sendMessage(
        "❌ আদিল স্যার এই নম্বরটি Reply করা pending list-এ পাওয়া যায়নি।",
        threadID
      );
    }

    try {
      await api.addUserToGroup(member.id, threadID);

      return api.sendMessage(
        `✅ ${member.name}\n` +
        `ID: ${member.id}\n` +
        `আদিল বস এর নির্দেশে ওনাকে এড করা হয়েছে।`,
        threadID
      );
    } catch (err) {
      console.error("add command error:", err);

      return api.sendMessage(
        "❌ আদিল স্যার এই সদস্যকে এড করা যায়নি।\n" +
        "বটের অনুমতি ও API পরীক্ষা করো।",
        threadID
      );
    }
  }
};
