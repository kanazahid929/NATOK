module.exports = {
  config: {
    name: "oh",
    version: "1.1",
    role: 2,
    author: "acs prince",
    description: "Mention kore target set/off kore infinity bully mode",
    category: "fun",
    guide: {
      en: "{p}virus @mention   → ON\n{p}virus off @mention → OFF"
    }
  },

  langs: {
    en: {
      setSuccess: "𝗟𝗢𝗔𝗗𝗜𝗡𝗚 . . . ...\n👾🔥😈 𝗩𝗜͟𝗣 𝗝͟3-/// 𝗔͟𝗖͟͠𝗧𝗜͟͠𝗩𝗘𝗗📨💀⚡\n▓▓▓▓▓░░░░░ 99% {name} in this group 👾",
      offSuccess: "𝗩͟𝗜͟͠𝗣 𝗝͟3-/// 𝗢͟𝗙͟͠𝗙 👾 {name} in this group 📨😈",
      noMention: "__\\👾প্রিন্স বস একবার খানকির পোলারে ম্যানশন দেন ওর মার ভো🎯দা খুলে ফেলব চু-/দে !! 😈📨",
      notActive: "{name} er jonno bully mode on chilo na. 🤔"
    }
  },

  onStart: async function({ event, args, message, getLang, threadsData }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
      return message.reply(getLang("noMention"));
    }

    let targetId = Object.keys(event.mentions)[0];
    let targetName = event.mentions[targetId];
    let data = await threadsData.get(event.threadID, "data.goatTargets", {});

    if (args[0]?.toLowerCase() === "off") {
      if (data[targetId]) {
        delete data[targetId];
        await threadsData.set(event.threadID, data, "data.goatTargets");
        return message.reply(getLang("offSuccess", { name: targetName }));
      } else {
        return message.reply(getLang("notActive", { name: targetName }));
      }
    }

    data[targetId] = true;
    await threadsData.set(event.threadID, data, "data.goatTargets");
    message.reply(getLang("setSuccess", { name: targetName }));
  },

  onChat: async function({ event, message, threadsData }) {
    let data = await threadsData.get(event.threadID, "data.goatTargets", {});
    if (!data || !data[event.senderID]) return;

    const bullyLines = [
      " তোর মারে পাকিস্তান রাজধানী লাহোর এ নিয়ে উচ্চ শিহ্মায় শিহ্মিত করে চুদবো-))!!🥱🌻🫦💦💯",
      "তোর মারে আটলান্টিক মহাসাগরের টাইটানিক জাহাজ ডুবে যাওয়ার গল্প শুনিয়ে চুদি -🌻💙👄👩‍❤️‍💋‍👨",
      "তোর মারে চাঁদের দেশে নিয়ে গিয়ে গুয়া মারি শুয়োরের বাচ্চা কারে গালি দেস<]]!!🫦🤰💚💯💯 🫦🫦😆😹🤟",
      "_____ওহ নেশা,,,নেশা,,,নেশা নেশা লেগেছে তোর মাকে চুদার নেশাহহ..!! 👩‍❤️‍💋‍👨🥺💚😆",
      "প্রিন্স এর পোলা তোর মারে পাকিস্তান রাজধানী লাহোর এ নিয়ে উচ্চ শিহ্মায় শিহ্মিত করে চুদবো-))!!🥱🌻🫦💦💯🤥",
      "গুরু গুরু মহা গুরু তোর মার ভোদার ভিতরে আমার ধোন ভরে এখন করবো চোদা শুরু🥺💯-) 🌺😘😻",
      "𝙏𝙝𝙞𝙨 𝙖𝙗𝙤𝙪𝙩 𝙡𝙞𝙣𝙚✨🍒🍭_____🐰🍒🌸 তোর বুইরা মারে তোর নানার কান্দে ফেলাইয়া টাস টুস করে চুদি -:)😇🍒🐶🫰",
      "তোর মাকে চুদে সেলেব্রিটি হয়ে গেলাম \n23h      𝗟𝗶𝗸𝗲      𝗥𝗲𝗽𝗹𝘆   😆 79K",
      "তোর গরিব যার টিনের ঘরের কামলার মারে চুদি কৃষি পরিবারের সন্তান -!🧛‍♀️🌺💦🤸🏽",
      "_____ গুরু গুরু মহা গুরু তোর মার ভোদার ভিতরে আমার ধোন ভরে এখন করবো চোদা শুরু🥺💯-) 🌺😘😻",
      " আমার শহরে তোর মত বট জাত নটা অ্যালাও তোর আমার ভোদার খাল খুলে ফেলব😈🔥",
      " তোর মার গুদে পাহাড় নির্মাণের কাজ করব বজ্জাত নাস্তিক 😈💥",
      "তোর মার দুধ দিয়ে এক কাপ চা দে তারপরে এসএমএস কর 😈🎯",
      "তোর মার গুদে কুত্তার ধন ঢুকাবো হিজলা মাগির পোলা তোর কানার মাইরে চু-/দিহহ😈💥",
      "তোর মার ভোদাটা তুই আমার হাত থেকে বাঁচা বাঁচা বাঁচা 😈😈🔥"
    ];

    let randomLine = bullyLines[Math.floor(Math.random() * bullyLines.length)];
    message.reply(randomLine);
  }
};
