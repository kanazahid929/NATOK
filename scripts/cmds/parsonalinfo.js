const axios = require("axios");

const TRIGGERS = [
  "আদিল",
  "আদিল কই",
  "adil",
  "adil vau",
  "adil koi",
  "misty kotay",
  "মিষ্টি",
  "misty"
];

const DRIVE_FILE_IDS = [
  "10007qPSfybQRlI_Xz0KoaPoROQng3wVD",
  "1KsdDJ8Ry0V5ndyyYnZKst_s4LLQUkcSy"
];

const DIRECT_IMAGE_URLS = DRIVE_FILE_IDS.map(
  id => `https://drive.google.com/uc?export=download&id=${id}`
);

const REPLY_TEXT = `    ╭•┄┅════❁🌺❁════┅┄•╮
কি হয়েছে পাখি আমার বস মিস্টার বিখ্যাত বিজ্ঞানী আদিল স্যারকে এত ডাকাডাকির কি হয়েছে 😼🪄

__ আমার বস এখন অনেক বিজি আছে বসের নাম মাইকিং করেও লাভ নাই 🍷👀😩 
✢━━━━━━━━━━━━━━━✢💫(✷‿✷)°🐹
যদি খুব বেশি প্রয়োজন হয় সরাসরি বসের এক্সপেরিমেন্ট রুম - Department of Law -তে চলে যাও বসের দেখা পেতে পারো 👀🚩
        ✢━━━━━━━━━━━━━━━✢
 বসের FB ID  : https://www.facebook.com/profile.php?id=61596235810120 কোনো মেয়েকে দিস না আবার 😩 তুই বসের সাক্ষাত পাওয়ার জন্য কান্নাকাটি করছিলি তাই তোকে গোপনে দিলাম 😻🍭
╭────────────♡彡 
╰➤😻🍭𝘾 𝙀 𝙊  ⸙ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲  !`;

// প্রতিটি গ্রুপের আলাদা ছবি সিরিয়াল
const imageIndexes = new Map();

function hasTriggerWord(text = "") {
  const lower = text.toLowerCase().trim();
  if (!lower) return false;

  return TRIGGERS.some(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`,
      "i"
    );
    return regex.test(lower);
  });
}

module.exports = {
  config: {
    name: "adil",
    version: "1.1",
    author: "prince",
    role: 0,
    category: "fun",
    guide: "prince"
  },

  onStart: async function ({ message, event }) {
    await sendadilReply(message, event);
  },

  onChat: async function ({ message, event }) {
    if (!event?.body) return;
    if (!hasTriggerWord(event.body)) return;

    await sendadilReply(message, event);
  }
};

async function sendadilReply(message, event) {
  const threadID = event?.threadID || message?.threadID || "default";

  // বর্তমান ছবির সিরিয়াল নির্বাচন
  const currentIndex = imageIndexes.get(threadID) || 0;
  const url = DIRECT_IMAGE_URLS[currentIndex];

  try {
    let stream;

    if (
      global.utils &&
      typeof global.utils.getStreamFromUrl === "function"
    ) {
      stream = await global.utils.getStreamFromUrl(url);
    } else {
      const response = await axios.get(url, {
        responseType: "stream"
      });
      stream = response.data;
    }

    if (stream) {
      await message.reply({
        body: REPLY_TEXT,
        attachment: stream
      });

      // সফলভাবে পাঠানোর পর পরবর্তী ছবিতে যাবে
      imageIndexes.set(
        threadID,
        (currentIndex + 1) % DIRECT_IMAGE_URLS.length
      );

      return;
    }
  } catch (error) {
    console.error("Adil image error:", error);
  }

  // ছবি লোড না হলে শুধু টেক্সট পাঠাবে
  await message.reply({
    body: REPLY_TEXT
  });
}
