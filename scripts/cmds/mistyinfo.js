const axios = require("axios");

const TRIGGERS = [
  "মিষ্টি পাখি",
  "মিষ্টি কই",
  "মিষ্টি",
  "misty",
  "jan",
  "misty kotay",
  "misty koi",
  "kolixa"
];

const DRIVE_FILE_ID = "1KsdDJ8Ry0V5ndyyYnZKst_s4LLQUkcSy";
const DIRECT_IMAGE_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;

const REPLY_TEXT = `    ╭•┄┅════❁🌺❁════┅┄•╮
কি হয়েছে পাখি আমার মেডাম মিস্টার বিখ্যাত বিজ্ঞানী মিষ্টি মেডাম কে এত ডাকাডাকির কি হয়েছে 😼🪄

__ আমার মেডাম এখন অনেক বিজি আছে MEM এর নাম মাইকিং করেও লাভ নাই 🍷👀😩 
✢━━━━━━━━━━━━━━━✢💫(✷‿✷)°🐹
যদি খুব বেশি প্রয়োজন হয় তাহলে আমার আদিল বসের ইনবক্সে সরাসরি চলে যাও মেডাম এর দেখা পেতে পারো 👀🚩
        ✢━━━━━━━━━━━━━━━✢
না হলে আমার মেডাম এর প্রিয় মানুষ আদিল বসকে নক করো বসের FB ID  : https://www.facebook.com/profile.php?id=61596235810120 কোনো মেয়েকে দিস না আবার 😩 তুই বসের সাক্ষাত পাওয়ার জন্য কান্নাকাটি করছিলি তাই তোকে গোপনে দিলাম 😻🍭
╭────────────♡彡 
╰➤😻🍭𝘾 𝙀 𝙊  ⸙ 𝐌𝐈𝐒𝐓𝐘  !`;

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
    name: "misty",
    version: "1.0",
    author: "prince",
    role: 0,
    category: "fun",
    guide: "prince"
  },

  onStart: async function ({ message }) {
    await sendmistyReply(message);
  },

  onChat: async function ({ message, event }) {
    if (!event?.body) return;
    if (!hasTriggerWord(event.body)) return;
    await sendmistyReply(message);
  }
};

async function sendmistyReply(message) {
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
