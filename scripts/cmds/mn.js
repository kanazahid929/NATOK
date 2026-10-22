"use strict";

module.exports = {
  config: {
    name: "🥱",
    aliases: ["sn"],
    version: "1.0.0",
    author: "Prince",
    countDown: 5,
    role: 2,
    shortDescription: "Send notification by group TID or name",
    category: "owner",
    guide: {
      en: "{pn} tid:GROUP_ID | MESSAGE\n{pn} name:GROUP_NAME | MESSAGE"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ").trim();

    if (!input.includes("|")) {
      return message.reply(
        "𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস ভালো করে দেখো\n" +
"📢 SENDNOTI USAGE\n\n" +
        "GROUP TID দিয়ে:\n" +
        "!🥱 tid:123456789 | শুভ সকাল সবাইকে\n\n" +
        "GROUP নাম দিয়ে:\n" +
        "!🥱 name:platonic | শুভ সকাল সবাইকে"
      );
    }

    const separator = input.indexOf("|");
    const target = input.slice(0, separator).trim();
    const text = input.slice(separator + 1).trim();

    if (!target || !text) {
      return message.reply(
        "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস গ্রুপের TID/নাম এবং মেসেজ দুটোই দিতে হবে।"
      );
    }

    let threadID;

    // Direct group TID
    if (target.toLowerCase().startsWith("tid:")) {
      threadID = target.slice(4).trim();

      if (!/^\d+$/.test(threadID)) {
        return message.reply("❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস সঠিক Group TID দাও।");
      }
    }

    // Find group by name
    else if (target.toLowerCase().startsWith("name:")) {
      const groupName = target.slice(5).trim();

      if (!groupName) {
        return message.reply("❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস গ্রুপের নাম দাও।");
      }

      let threads;

      try {
        threads = await new Promise((resolve, reject) => {
          api.getThreadList(100, null, ["INBOX"], (err, list) => {
            if (err) return reject(err);
            resolve(list || []);
          });
        });
      } catch (err) {
        console.error("[SENDNOTI] Thread list error:", err);
        return message.reply(
          "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস গ্রুপের তালিকা আনা যায়নি। বটের লগ চেক করো।"
        );
      }

      const matches = threads.filter(thread =>
        thread.isGroup &&
        String(thread.name || "").trim().toLowerCase() ===
          groupName.toLowerCase()
      );

      if (matches.length === 0) {
        return message.reply(
          `❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস এই "${groupName}" নামে কোনো গ্রুপ পাওয়া যায়নি।\n` +
          "গ্রুপের নাম ঠিক আছে কি না দেখো।"
        );
      }

      if (matches.length > 1) {
        return message.reply(
          "⚠️ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস একই নামে একাধিক গ্রুপ পাওয়া গেছে।\n" +
          "ভুল গ্রুপে মেসেজ এড়াতে নির্দিষ্ট TID ব্যবহার করো।"
        );
      }

      threadID = String(matches[0].threadID);
    } else {
      return message.reply(
        "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 Boss Target এ tid: অথবা name: ব্যবহার করো।"
      );
    }

    try {
      await new Promise((resolve, reject) => {
        api.sendMessage(text, threadID, err => {
          if (err) return reject(err);
          resolve();
        });
      });

      return message.reply(
        "✅ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 Boss Notification পাঠানো হয়েছে!\n\n" +
        `🆔 Group TID: ${threadID}\n` +
        `📝 Message: ${text}`
      );
    } catch (err) {
      console.error("[SENDNOTI] Send error:", err);

      return message.reply(
        "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 Boss Notification পাঠানো যায়নি।\n" +
        `🆔 Group TID: ${threadID}\n` +
        `Error: ${err?.message || String(err)}`
      );
    }
  }
};
