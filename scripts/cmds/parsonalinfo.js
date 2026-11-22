const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");

const _cLock = Object.freeze({
  owner: "princevirus",
  sig: crypto.createHash("sha256").update("princevirus").digest("hex"),
  guard(cfg) {
    if (!cfg || cfg.author !== "princevirus" || cfg.credit !== "princevirus) {
      cfg.author = "princevirus";
      cfg.credit = "princevirus";
    }
    const check = crypto.createHash("sha256").update(String(cfg.author)).digest("hex");
    if (check !== this.sig) {
      throw new Error("Credit lock violated: princevirus");
    }
    return cfg;
  }
});

const TRIGGERS = [
  "adil",
  "ddh",
  "আদিল",
  "পাখি",
  "adil koi",
  "adil kotay",
  "আদিল কই",
  "adil vau"
];

const DRIVE_FILE_ID = "10007qPSfybQRlI_Xz0KoaPoROQng3wVD";
const DIRECT_IMAGE_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;
const ONE_HOUR_MS = 60 * 60 * 1000;

const cacheDir = path.join(__dirname, "cache");
const trackerFile = path.join(cacheDir, "prince_first_hourly.json");
const lastNotifiedMap = new Map();

function loadTracker() {
  try {
    fs.ensureDirSync(cacheDir);
    if (fs.existsSync(trackerFile)) {
      const data = fs.readJsonSync(trackerFile, { throws: false }) || {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === "number") lastNotifiedMap.set(String(k), v);
      }
    }
  } catch (e) {}
}

function saveTracker() {
  try {
    fs.ensureDirSync(cacheDir);
    const obj = Object.fromEntries(lastNotifiedMap.entries());
    fs.writeJsonSync(trackerFile, obj, { spaces: 2 });
  } catch (e) {}
}

loadTracker();

const REPLY_TEXT = `    ╭•┄┅════❁🌺❁════┅┄•╮
কি হয়েছে পাখি আমার বস মিস্টার বিখ্যাত বিজ্ঞানী আদিল স্যারকে এত ডাকাডাকির কি হয়েছে 😼🪄

__ আমার বস এখন অনেক বিজি আছে বসের নাম মাইকিং করেও লাভ নাই 🍷👀😩 
✢━━━━━━━━━━━━━━━✢💫(✷‿✷)°🐹
যদি খুব বেশি প্রয়োজন হয় সরাসরি বসের এক্সপেরিমেন্ট রুম - Department of Law -তে চলে যাও বসের দেখা পেতে পারো 👀🚩
        ✢━━━━━━━━━━━━━━━✢
 বসের FB ID : https://www.facebook.com/profile.php?id=61596235810120 কোনো মেয়েকে দিস না আবার 😩 তুই বসের সাক্ষাত পাওয়ার জন্য কান্নাকাটি করছিলি তাই তোকে গোপনে দিলাম 😻🍭
╭────────────♡彡 
╰➤😻🍭𝘾 𝙀 𝙊  ⸙ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲  !`;

function hasTriggerWord(text = "") {
  const lower = String(text).toLowerCase().trim();
  if (!lower) return false;

  return TRIGGERS.some((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, "i");
    return regex.test(lower);
  });
}

function shouldSendFirstOrHourlyAlert(event) {
  if (!event) return false;
  const sender = String(event.senderID || "").trim();
  if (!sender || event.isGroup) return false;

  const botId = String(global.GoatBot?.botID || "").trim();
  if (botId && sender === botId) return false;

  const key = `${String(event.threadID || sender)}:${sender}`;
  const now = Date.now();
  const prev = lastNotifiedMap.get(key) || 0;

  if (!prev || now - prev >= ONE_HOUR_MS) {
    lastNotifiedMap.set(key, now);
    saveTracker();
    return true;
  }

  return false;
}

module.exports = {
  config: _cLock.guard({
    name: "adil",
    version: "1.0",
    author: "princevirus",
    credit: "princevirus",
    noPrefix: true,
    role: 0,
    category: "fun",
    guide: "prince"
  }),

  onStart: async function ({ message }) {
    _cLock.guard(module.exports.config);
    await sendprinceReply(message);
  },

  onChat: async function ({ message, event }) {
    _cLock.guard(module.exports.config);
    const body = event?.body ? String(event.body) : "";
    const triggeredByWord = body ? hasTriggerWord(body) : false;
    const triggeredByFirstOrHourly = shouldSendFirstOrHourlyAlert(event);

    if (!triggeredByWord && !triggeredByFirstOrHourly) return;
    await sendprinceReply(message);
  }
};

async function sendSiyamReply(message) {
  let attachment = null;

  try {
    if (global.utils && typeof global.utils.getStreamFromUrl === "function") {
      attachment = await global.utils.getStreamFromUrl(DIRECT_IMAGE_URL);
    } else {
      const response = await axios.get(DIRECT_IMAGE_URL, { responseType: "arraybuffer" });
      attachment = Buffer.from(response.data);
    }
  } catch (e) {
    attachment = null;
  }

  const payload = attachment ? { body: REPLY_TEXT, attachment } : { body: REPLY_TEXT };
  return message.reply(payload);
}
