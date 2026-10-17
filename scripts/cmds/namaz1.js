"use strict";

const fs = require("fs-extra");
const path = require("path");

const DATA_FILE = path.join(__dirname, "namaz-data.json");
const TZ = "Asia/Dhaka";
const INTERVAL = 15000;

const TIMES = {
  Fajr: "04:35",
  Dhuhr: "13:05",
  Asr: "16:35",
  Maghrib: "18:10",
  Isha: "19:45",
  Jumuah: "13:20"
};

const NAMES = {
  Fajr: "ফজরের",
  Dhuhr: "যোহরের",
  Asr: "আসরের",
  Maghrib: "মাগরিবের",
  Isha: "এশার",
  Jumuah: "জুমার"
};

let apiBot = null;
let timer = null;
let busy = false;

function getParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const result = {};
  for (const p of parts) result[p.type] = p.value;
  return result;
}

function getToday() {
  const p = getParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function getMinute() {
  const p = getParts();
  return Number(p.hour) * 60 + Number(p.minute);
}

function timeToMinute(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

async function readData() {
  try {
    if (await fs.pathExists(DATA_FILE)) {
      const d = await fs.readJson(DATA_FILE);
      return {
        enabled: d.enabled === true,
        sent: d.sent || {}
      };
    }
  } catch (e) {
    console.error("[NAMAZ] Read error:", e.message);
  }

  return { enabled: false, sent: {} };
}

async function saveData(data) {
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
}

function makeNotice(key) {
  if (key === "Jumuah") {
    return `🕌 জুমার নামাজের নোটিশ 🕌
━━━━━━━━━━━━━━━━━━

📢 সকল মুসল্লিদের অবগতির জন্য জানানো যাচ্ছে যে,
আজ পবিত্র জুমার দিন। সবাইকে জুমার নামাজ আদায়ের অনুরোধ রইল। ✅

🤍 আসুন, আমরা সকলে পবিত্রতা ও শৃঙ্খলা বজায় রেখে জুমার নামাজ আদায় করি।

🕋 জুমা মোবারক।
আল্লাহ তাআলা আমাদের সকলের নামাজ ও ইবাদত কবুল করুন। আমিন। 🤲

━━━━━━━━━━━━━━━━━━
বাংলাদেশ সময় দুপুর ১:২০ মিনিট
আদেশক্রমে...!!
PORICHALOK — আদিল 🫰💫`;
  }

  const duration = key === "Isha" ? "১৫" : "১০";

  return `🌸✨ ${NAMES[key]} নামাজের নোটিশ ✨🌸

🕌 ${NAMES[key]} নামাজের নোটিশের সময় হয়েছে।
সবাই নামাজ আদায়ের প্রস্তুতি গ্রহণ করি, ইনশাআল্লাহ 🤲💖

⏳ নামাজের সম্মানার্থে ${duration} মিনিট টেক্সট অফ রাখি সবাই। 🙏🤍

🌿 নামাজ আগে, সবকিছু পরে।
🤲 আল্লাহ আমাদের সবাইকে নামাজ আদায় করার তৌফিক দান করুন। আমিন। 🕊️

নামাজ বাদ দিও না বন্ধু।
এপাড়ের থেকে ওপাড়ের
জীবন সুন্দর। 🫵

আদেশক্রমে...!!
PORICHALOK — আদিল 🫰💫
🔕 ${duration} মিনিট টেক্সট অফ ❌`;
}

function getThreads() {
  return new Promise((resolve, reject) => {
    apiBot.getThreadList(100, null, ["INBOX"], (err, threads) => {
      if (err) return reject(err);
      resolve(Array.isArray(threads) ? threads : []);
    });
  });
}

function sendMessage(threadID, text) {
  return new Promise((resolve, reject) => {
    apiBot.sendMessage(text, threadID, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

async function sendToAllGroups(text, sentGroups) {
  const threads = await getThreads();

  const ids = [...new Set(
    threads
      .filter(t =>
        t &&
        t.threadID &&
        (
          t.isGroup === true ||
          (Array.isArray(t.participantIDs) &&
           t.participantIDs.length > 2)
        )
      )
      .map(t => String(t.threadID))
  )];

  for (const id of ids) {
    if (sentGroups[id]) continue;

    try {
      await sendMessage(id, text);
      sentGroups[id] = true;
    } catch (e) {
      console.error("[NAMAZ] Send failed:", id, e.message);
    }
  }

  return ids.length;
}

async function checkSchedule() {
  if (busy || !apiBot) return;
  busy = true;

  try {
    const data = await readData();
    if (!data.enabled) return;

    const p = getParts();
    const today = getToday();
    const minute = getMinute();

    for (const key of Object.keys(TIMES)) {
      if (key === "Jumuah" && p.weekday !== "Friday") {
        continue;
      }

      if (minute !== timeToMinute(TIMES[key])) {
        continue;
      }

      const recordKey = `${today}-${key}`;

      if (!data.sent[recordKey]) {
        data.sent[recordKey] = {};
      }

      if (data.sent[recordKey].done) continue;

      // Save successful group deliveries to prevent duplicates.
      const sentGroups = data.sent[recordKey];
      const total = await sendToAllGroups(
        makeNotice(key),
        sentGroups
      );

      const sentCount = Object.keys(sentGroups).filter(
        id => id !== "done" && sentGroups[id] === true
      ).length;

      if (total > 0 && sentCount >= total) {
        sentGroups.done = true;
      }

      await saveData(data);
      console.log(
        `[NAMAZ] ${key}: ${sentCount}/${total} groups`
      );
    }

    // Retain only recent daily records.
    const keys = Object.keys(data.sent).sort();
    if (keys.length > 40) {
      for (const key of keys.slice(0, keys.length - 30)) {
        delete data.sent[key];
      }
      await saveData(data);
    }
  } catch (e) {
    console.error("[NAMAZ] Schedule error:", e.message);
  } finally {
    busy = false;
  }
}

function startScheduler(api) {
  apiBot = api;

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    checkSchedule();
  }, INTERVAL);

  checkSchedule();
}

function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}

module.exports = {
  config: {
    name: "namaz",
    version: "3.1.0",
    author: "Prince",
    countDown: 3,
    role: 2,
    description: {
      en: "Automatic prayer notices at configured times"
    },
    category: "utility",
    guide: {
      en: "{pn} on | off | status"
    }
  },

  onLoad: async function ({ api }) {
    apiBot = api;
    const data = await readData();

    if (data.enabled) {
      startScheduler(api);
    }
  },

  onStart: async function ({ api, args, message }) {
    apiBot = api;
    const action = String(args[0] || "status").toLowerCase();
    const data = await readData();

    if (action === "on") {
      data.enabled = true;
      await saveData(data);
      startScheduler(api);

      return message.reply(
        "✅ আদিল বস নামাজের অটোমেটিক নোটিশ চালু হয়েছে!\n\n" +
        "🇧🇩 বাংলাদেশ সময় (Asia/Dhaka)\n" +
        "🌅 ফজর: 4:35 AM\n" +
        "☀️ যোহর: 1:05 PM\n" +
        "🌤️ আসর: 4:35 PM\n" +
        "🌇 মাগরিব: 6:10 PM\n" +
        "🌙 এশা: 7:45 PM\n" +
        "🕌 জুমা: শুক্রবার 1:20 PM"
      );
    }

    if (action === "off") {
      data.enabled = false;
      await saveData(data);
      stopScheduler();

      return message.reply("🔕 আদিল বস নামাজের অটোমেটিক নোটিশ বন্ধ করা হয়েছে।");
    }

    if (action === "status") {
      return message.reply(
        `𝗣͜͡𝗿𝗶𝗻𝗰𝗲💫-BOSS`
        `🕌 NAMAZ STATUS\n` +
        `অবস্থা: ${data.enabled ? "চালু ✅" : "বন্ধ 🔕"}\n` +
        `সময় অঞ্চল: বাংলাদেশ\n\n` +
        `🌅 ফজর: 4:35 AM\n` +
        `☀️ যোহর: 1:05 PM\n` +
        `🌤️ আসর: 4:35 PM\n` +
        `🌇 মাগরিব: 6:10 PM\n` +
        `🌙 এশা: 7:45 PM\n` +
        `🕌 জুমা: শুক্রবার 1:20 PM\n\n` +
        ``
     );
    }

    return message.reply(
      "ব্যবহার:\n!namaz on\n!namaz off\n!namaz status"
    );
  }
};
