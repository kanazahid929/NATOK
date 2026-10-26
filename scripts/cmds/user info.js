const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const DATA_DIR = path.join(__dirname, "userinfo_data");
const DATA_FILE = path.join(DATA_DIR, "activity.json");

fs.ensureDirSync(DATA_DIR);

let activityData = fs.existsSync(DATA_FILE)
  ? fs.readJsonSync(DATA_FILE, { throws: false }) || {}
  : {};

let saveQueue = Promise.resolve();

function saveActivity() {
  saveQueue = saveQueue
    .then(() => fs.writeJson(DATA_FILE, activityData, { spaces: 2 }))
    .catch(err => console.error("[USERINFO SAVE]", err));
  return saveQueue;
}

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getActivity(threadID, uid) {
  const record = activityData[`${threadID}_${uid}`];

  if (!record) {
    return {
      total: 0,
      weekly: 0,
      lastActive: null,
      level: "Not enough data"
    };
  }

  const today = new Date();
  let weekly = 0;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    weekly += record.daily?.[dayKey(date)] || 0;
  }

  let level = "Low";
  if (weekly >= 50) level = "High";
  else if (weekly >= 15) level = "Moderate";
  else if (weekly === 0) level = "No recent activity";

  return {
    total: record.total || 0,
    weekly,
    lastActive: record.lastActive || null,
    level
  };
}

module.exports = {
  config: {
    name: "userinfo",
    aliases: ["ui", "user"],
    version: "3.0.0",
    author: "Prince",
    countDown: 5,
    role: 2,
    description: {
      en: "Advanced member info card and activity tracker"
    },
    category: "utility",
    guide: {
      en: "{pn} @mention | reply | UID"
    }
  },

  // Tracks messages from the time this command is installed.
  onChat: async function ({ event }) {
    try {
      if (!event.threadID || !event.senderID) return;
      if (String(event.senderID) === String(event.threadID)) return;

      const key = `${event.threadID}_${event.senderID}`;
      const today = dayKey();

      if (!activityData[key]) {
        activityData[key] = {
          total: 0,
          daily: {},
          lastActive: null
        };
      }

      const record = activityData[key];

      record.total = (record.total || 0) + 1;
      record.daily[today] = (record.daily[today] || 0) + 1;
      record.lastActive = new Date().toISOString();

      // Keep only the latest 30 days of daily counts.
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      for (const date of Object.keys(record.daily)) {
        if (date < dayKey(cutoff)) delete record.daily[date];
      }

      await saveActivity();
    } catch (err) {
      console.error("[USERINFO TRACKER]", err);
    }
  },

  onStart: async function ({ api, event, args, message }) {
    let cardPath;

    try {
      let uid = null;

      if (event.messageReply?.senderID) {
        uid = String(event.messageReply.senderID);
      }

      if (event.mentions && Object.keys(event.mentions).length) {
        uid = String(Object.keys(event.mentions)[0]);
      }

      if (args?.length) {
        const input = String(args[0]).replace(/[^\d]/g, "");
        if (/^\d{5,}$/.test(input)) uid = input;
      }

      if (!uid) uid = String(event.senderID);

      const [users, threadInfo] = await Promise.all([
        api.getUserInfo(uid),
        api.getThreadInfo(event.threadID)
      ]);

      const user = users?.[uid];

      if (!user) {
        return message.reply("❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস সদস্যের তথ্য পাওয়া যায়নি।");
      }

      const members = threadInfo.participantIDs || [];
      const admins = threadInfo.adminIDs || [];

      const isMember = members.some(id => String(id) === uid);

      const isAdmin = admins.some(item => {
        const id = typeof item === "object"
          ? item.id || item.userID
          : item;

        return String(id) === uid;
      });

      const genderMap = {
        1: "Female",
        2: "Male",
        3: "Custom / Unknown"
      };

      const name = user.name || "Unknown";
      const gender = genderMap[user.gender] || "Unknown";
      const groupName = threadInfo.threadName || "Unnamed Group";
      const activity = getActivity(event.threadID, uid);

      const lastActive = activity.lastActive
        ? new Date(activity.lastActive).toLocaleString("en-GB", {
            timeZone: "Asia/Dhaka"
          })
        : "Tracking not started";

      // Build an image card.
      const width = 900;
      const height = 1120;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#101827");
      bg.addColorStop(1, "#25133b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Card border
      ctx.strokeStyle = "#d6b46a";
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 18, width - 36, height - 36);

      // Header
      ctx.fillStyle = "#d6b46a";
      ctx.font = "bold 42px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PRINCE • USER PROFILE", width / 2, 85);

      // Avatar
      let avatar = null;
      const avatarUrl = user.thumbSrc || user.photoUrl || "";

      if (avatarUrl) {
        try {
          const response = await loadImage(avatarUrl);
          avatar = response;
        } catch (_) {}
      }

      if (avatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 190, 82, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, width / 2 - 82, 108, 164, 164);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(width / 2, 190, 82, 0, Math.PI * 2);
        ctx.fillStyle = "#39445d";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px sans-serif";
        ctx.fillText("USER", width / 2, 207);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText(name.slice(0, 32), width / 2, 325);

      ctx.fillStyle = "#d6b46a";
      ctx.font = "24px sans-serif";
      ctx.fillText(`UID: ${uid}`, width / 2, 370);

      function drawSection(title, y, lines) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#d6b46a";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(title, 65, y);

        ctx.fillStyle = "#f1f3f8";
        ctx.font = "23px sans-serif";

        lines.forEach((line, index) => {
          ctx.fillText(line, 70, y + 42 + index * 38);
        });
      }

      drawSection("GROUP INFORMATION", 435, [
        `Group: ${groupName.slice(0, 34)}`,
        `Members: ${members.length}`,
        `Group member: ${isMember ? "Yes" : "No"}`,
        `Group admin: ${isAdmin ? "Yes" : "No"}`
      ]);

      drawSection("ACTIVITY REPORT", 650, [
        `Messages tracked (all time): ${activity.total}`,
        `Messages tracked (last 7 days): ${activity.weekly}`,
        `Activity level: ${activity.level}`,
        `Last tracked message: ${lastActive}`
      ]);

      ctx.textAlign = "center";
      ctx.fillStyle = "#aeb7c9";
      ctx.font = "19px sans-serif";
      ctx.fillText(
        "Activity is counted only after tracking starts.",
        width / 2,
        1035
      );
      ctx.fillText("GOAT BOT V2 • BY PRINCE", width / 2, 1070);

      cardPath = path.join(
        DATA_DIR,
        `card_${Date.now()}_${uid}.png`
      );

      await fs.writeFile(cardPath, canvas.toBuffer("image/png"));

      const caption = [
        `👤 ${name}`,
        `🆔 UID: ${uid}`,
        `⚧ Gender: ${gender}`,
        `🔗 Profile: ${user.profileUrl || "Not available"}`,
        "",
        `💬 Messages tracked (7 days): ${activity.weekly}`,
        `⭐ Activity: ${activity.level}`,
        `🕒 Last activity: ${lastActive}`,
        "",
        "⚠️ Activity tracking starts when the command is installed."
      ].join("\n");

      return api.sendMessage(
        {
          body: caption,
          attachment: fs.createReadStream(cardPath)
        },
        event.threadID,
        () => {
          fs.remove(cardPath).catch(() => {});
        },
        event.messageID
      );

    } catch (error) {
      console.error("[USERINFO ERROR]", error);

      if (cardPath) {
        fs.remove(cardPath).catch(() => {});
      }

      return message.reply(
        "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস Info Card তৈরি করা যায়নি।\n" +
        "Canvas dependency ও bot console error পরীক্ষা করো।"
      );
    }
  }
};
