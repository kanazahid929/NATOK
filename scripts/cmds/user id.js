module.exports = {
  config: {
    name: "userid",
    version: "1.3.0",
    author: "Prince",
    countDown: 10,
    role: 2,
    description: {
      en: "Show all group member names and UIDs"
    },
    category: "utility",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const info = await api.getThreadInfo(event.threadID);
      const ids = [...new Set(info.participantIDs || [])];

      if (!ids.length) {
        return message.reply(
          "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস কোনো সদস্য পাওয়া যায়নি।"
        );
      }

      const lines = [];

      for (let i = 0; i < ids.length; i++) {
        const uid = ids[i];
        let name = "নাম পাওয়া যায়নি";

        try {
          const users = await api.getUserInfo(uid);
          if (users?.[uid]?.name) {
            name = users[uid].name;
          }
        } catch (e) {
          // UID থাকবে, নাম না পেলেও
        }

        lines.push(
          `${i + 1}. Name: ${name}\nUID: ${uid}`
        );
      }

      const header =
        `👑 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 BOSS — MEMBER REPORT..💫\n` +
        `👥 Total Members: ${ids.length}\n\n`;

      // মেসেজের দৈর্ঘ্য অনুযায়ী ভাগ হবে,
      // নির্দিষ্ট ৮ জন করে নয়।
      const maxLength = 1800;
      const chunks = [];
      let current = header;

      for (const line of lines) {
        const item = line + "\n\n";

        if (
          current.length + item.length > maxLength &&
          current !== header
        ) {
          chunks.push(current.trimEnd());
          current = header;
        }

        current += item;
      }

      if (current.trim() !== header.trim()) {
        chunks.push(current.trimEnd());
      }

      for (let i = 0; i < chunks.length; i++) {
        const footer =
          chunks.length > 1
            ? `\n\n📋 List ${i + 1}/${chunks.length}`
            : "";

        await message.reply(chunks[i] + footer);
      }
    } catch (error) {
      console.error("[userid]", error);
      return message.reply(
        "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস সদস্যদের তথ্য আনা যায়নি। Bot permission পরীক্ষা করো।"
      );
    }
  }
};
