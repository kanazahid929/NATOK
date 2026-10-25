module.exports = {
  config: {
    name: "ow",
    version: "1.5",
    role: 0,
    author: "prince",
    description: "Mention kore target set/off kore infinity ok mode",
    category: "fun",
    guide: {
      en: "{p}ok @mention → ON\n{p}ok off @mention → OFF"
    }
  },

  langs: {
    en: {
      setSuccess: "𝗟𝗢𝗔𝗗𝗜𝗡𝗚 . . . ...\n {name} in this group ❗🏴",
      offSuccess: " 𝗢͟𝗙͟͠𝗙 🏴 {name}",
      noMention: "__\\👾প্রিন্স বস",
      notActive: "{name} er jonno ok mode on chilo na 🤔"
    }
  },

  // OK MODE ON / OFF
  onStart: async function ({ event, args, message, getLang, threadsData }) {
    if (!event.mentions || Object.keys(event.mentions).length === 0) {
      return message.reply(getLang("noMention"));
    }

    const targetId = Object.keys(event.mentions)[0];
    const targetName = event.mentions[targetId];

    // 🔐 আলাদা storage (virus এর সাথে clash হবে না)
    const data = await threadsData.get(event.threadID, "data.okTargets", {});

    if (args[0]?.toLowerCase() === "off") {
      if (data[targetId]) {
        delete data[targetId];
        await threadsData.set(event.threadID, data, "data.okTargets");
        return message.reply(getLang("offSuccess", { name: targetName }));
      } else {
        return message.reply(getLang("notActive", { name: targetName }));
      }
    }

    data[targetId] = true;
    await threadsData.set(event.threadID, data, "data.okTargets");
    message.reply(getLang("setSuccess", { name: targetName }));
  },

  // AUTO REPLY (OK MODE)
  onChat: async function ({ event, message, threadsData }) {
    const data = await threadsData.get(event.threadID, "data.okTargets", {});
    if (!data || !data[event.senderID]) return;

    // ❌ undefined fix
    const name = event.senderName || Object.values(event.mentions || {})[0] || "🩷";

    const okLines = [
      
`🐰♡︎𝗕𝗲✨🍥𝗠𝗶𝗻𝗲-!<😻🍭!🧚‍♀️𝗜🐼-𝗪𝗶𝗹𝗹✨🍒𝗸𝗲𝗲𝗽😽𝘆𝗼𝘂-🧸💜-𝗙𝗼𝗿𝗲𝘃𝗲𝗿🌈🍒তুমি আমার সাধ্যের বাহিরে চাওয়া এক সুন্দর মানুষ।।🙂💔${name}`,
      `𝗟𝗶𝗳𝗲 𝗶𝘀 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝗶𝗳 𝘆𝗼𝘂 𝗗𝗼𝗻𝘁 𝗙𝗮𝗹𝗹 𝗶𝗻 𝗟𝗼𝘃𝗲 ♡︎_জীবন সুন্দর যদি কারো মায়ায় না পড়ো - ${name}`,
      ` 🐰✨𝗜 𝗟𝗼𝘃𝗲 𝗨<33 𝗦𝘂𝗰𝗵 𝗔𝗻 𝗨𝗴𝗹𝘆 𝗪𝗼𝗿𝗱✨🦋 𝗦𝗵𝗼𝘂𝗹𝗱 𝗕𝗲!ᵉ_🔐💜💫_একরাশ উচ্ছ্বাসের মাঝে আমার হটাৎ থেমে যাওয়ার কারণ তুমি🌸 ${name}`,
      ` 𝗣𝗲𝗵𝗹𝗶 𝗡𝗮𝘇𝗮𝗿 𝗠𝗮𝗶𝗻 𝗞𝗮𝗶𝗦𝗔 𝗝𝗔𝗗𝘂 𝗞𝗮𝗿 𝗗𝗶𝘆𝗔 🫶${name}`,
      `!!লাইন টা তুমার জন্য  ডুবেছি আমি তুমার প্রেমের অনন্ত মায়ায় 🙈 ༅༎❤️🌸__৫ღ🪶🩷অনেক༎ইচ্ছে༎করে༎তোমাকে༎খুব༎শক্ত༎করে༎জড়িয়ে༎ধরে༎বলি༎ভালোবাসি༎নিজের༎চেয়ে বেশি༅ ${name}`,
      `༊༅༎জান গো তুমি কোথায়-༊༅༎🥰🙈༊༅༎ওরা না আমারে সিঙ্গেল বলে খেপায়😕😞🥺༊༅💚 ${name}`,
      ` একটা তুমি থাকলে নিজেকে ☺️বদলে ফেলতাম༅༊✾︵☺️🤍${name}`,
      `  . ⎯͢⎯⃝💚🍒___ღ࿐༅༎🖤🌻💚✨𝐁𝐛𝐳 𝐅𝐞𝐞𝐋 𝐓𝐡𝐢𝐬 𝐋𝐢𝐧𝐞 :)>(🧡🦋♡︎⎯͢⎯⃝🩷যে চোখের চাহনিতে ছোট্টগল্পের বাস তার অন্তরে লুকিয়ে আছে হাজার ও উপন্যাস ♡︎⎯͢⎯⃝🩷🌻__ღ৫${name}`,
      ` ︵🦋জীবনে এমন কাউকে চাই︵✾༅ যার মধ্যে কোনো Ego- attitude🫰🤍থাকবে না༊︵✾ ●●❥____শুধু দিন শেষে এসে ✨🤍🫰 ❛❛দাবি করবে 🥰🤍✨ ❛❛ তুমি শুধু আমার──˙⁠❥${name}`,
      ` 🐰হাজার বার বিচ্ছেদের পরেও---🙂🥀কোটি বার আমার আপনাকেই চাই--- 😇🥀----${name}`,
      ` যখন থেকে পরী হয়ে বাসা বেধেঁছ আমার চোখে তখন থেকে তুমি ছাড়া আর কিছুই ভালো লাগেনা❤️${name}`,
      `✨𝗬𝗼𝘂𝗿𝗲 𝗻𝗼𝘁 𝗴𝗼𝗶𝗻𝗴 𝘁𝗼 𝗯𝗲 𝘁𝗵𝗲 𝘀𝗸𝘆.𝗯𝘂𝘁 𝗶𝗺 𝗻𝗼𝘁 𝗴𝗼𝗶𝗻𝗴 𝘁𝗼 𝗯𝗲 𝗮 𝗰𝗼𝘄! ${name}`,

      ` 🌈🍒তুমি বরং আকাশ হও মেঘ ভাসানোর বেলা আমি না হয় গোধুলি হবো নিছক সন্ধাবেলা..!${name}`,
      ` 💟🍒🐼🌻_তোমাকে ছাড়া আমি বুঝিনা কোনো কিছু যে আর পৃথিবী যেনে যাক তুমি সুধু আমার🥺🦋🪄${name}`,
      ` 💚🌺𝐈𝐭𝐬 𝐦𝐲 𝐁𝐞𝐬𝐭 𝐅𝐞𝐞𝐥𝐢𝐧𝐠🦋আকাশটা কাগজ হোক ! বৃষ্টি হবে কালি!💚🌻༅🙂🌸প্রকৃতি লিখবে প্রেমের  কবিতা 🌺${name}`,
      ` তোমার বুকের মাঝে চুমু দেবো আমি 👀চিরকাল জান🙈🥀🥰${name}`,
      `💚🌺𝐈𝐭𝐬 𝐦𝐲 𝐁𝐞𝐬𝐭 𝐅𝐞𝐞𝐥𝐢𝐧𝐠🦋আকাশটা কাগজ হোক ! বৃষ্টি হবে কালি!💚🌻༅🙂🌸প্রকৃতি লিখবে প্রেমের  কবিতা 🌺 LOVE YOU 🌛😑 বেশি হয়ে গেলো 😦 ${name}`,
      ` যদি তুমি মনে করো সুখে নেই তবে তুমি ফিরে আসো আমার বুকে এখনো আগ্লে রাখবো তোমাকে😒😒${name}`,
      ` 🥺💫🌧️\n\n\n\n\n oiiiiiii ${name}`,
    ];
    const randomLine = okLines[Math.floor(Math.random() * okLines.length)];
    message.reply(randomLine);
  }
};
