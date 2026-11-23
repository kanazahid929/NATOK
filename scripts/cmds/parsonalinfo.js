const axios = require("axios");

const TRIGGERS = [
  "আদিল",
  "আদিল কই",
  "adil",
  "adil vau",
  "adil koi",
  "adil kotay",
  "পাখি",
  "ddh"
];

const DRIVE_FILE_ID = "10007qPSfybQRlI_Xz0KoaPoROQng3wVD" "1KsdDJ8Ry0V5ndyyYnZKst_s4LLQUkcSy";
const DIRECT_IMAGE_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;

const REPLY_TEXT = `    ╭•┄┅════❁🌺❁════┅┄•╮
কি হয়েছে পাখি আমার বস মিস্টার বিখ্যাত বিজ্ঞানী আদিল স্যারকে এত ডাকাডাকির কি হয়েছে 😼🪄

__ আমার বস এখন অনেক বিজি আছে বসের নাম মাইকিং করেও লাভ নাই 🍷👀😩 
✢━━━━━━━━━━━━━━━✢💫(✷‿✷)°🐹
যদি খুব বেশি প্রয়োজন হয় সরাসরি বসের এক্সপেরিমেন্ট রুম - Department of Law -তে চলে যাও বসের দেখা পেতে পারো 👀🚩
        ✢━━━━━━━━━━━━━━━✢
 বসের FB ID  : https://www.facebook.com/profile.php?id=61596235810120 কোনো মেয়েকে দিস না আবার 😩 তুই বসের সাক্ষাত পাওয়ার জন্য কান্নাকাটি করছিলি তাই তোকে গোপনে দিলাম 😻🍭
╭────────────♡彡 
╰➤😻🍭𝘾 𝙀 𝙊  ⸙ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲  !`;

function hasTriggerWord(text = "") {
  const lower = text.toLowerCase().trim();
  if (!lower) return false;

  return TRIGGERS.some((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, "i");
    return regex.test(lower);
  });
}

module.exports = {
  config: {
    name: "adil",
    version: "1.0",
    author: "prince",
    role: 0,
    category: "fun",
    guide: "prince"
  },

  onStart: async function ({ message }) {
    await sendadilReply(message);
  },

  onChat: async function ({ message, event }) {
    if (!event?.body) return;
    if (!hasTriggerWord(event.body)) return;
    await sendadilReply(message);
  }
};

async function sendadilReply(message) {
  let attachment = null;

  try {
    if (global.utils && typeof global.utils.getStreamFromUrl === "function") {
      attachment = await global.utils.getStreamFromUrl(DIRECT_IMAGE_URL);
    } else {
      const response = await axios.get(DIRECT_IMAGE_URL, { responseType: "stream" });
      attachment = response.data;
    }
  } catch (e) {
    attachment = null;
  }

  const payload = attachment ? { body: REPLY_TEXT, attachment } : { body: REPLY_TEXT };
  return message.reply(payload);
}
