
const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "ac_activity.json");

let activityData = {};

try {
  if (fs.existsSync(dataPath)) {
    activityData = fs.readJsonSync(dataPath);
  }
} catch (error) {
  console.error("[ac] Data load error:", error);
}

let saveQueue = Promise.resolve();

function saveData() {
  saveQueue = saveQueue
    .then(() =>
      fs.writeJson(dataPath, activityData, { spaces: 2 })
    )
    .catch(error => console.error("[ac] Save error:", error));

  return saveQueue;
}

function formatDuration(seconds) {
  seconds = Math.floor(seconds || 0);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatTime(timestamp) {
  if (!timestamp) return "𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস এর এখনো কোনো রেকর্ড নেই";

  return new Date(timestamp).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

module.exports = {
  config: {
    name: "ac",
    version: "1.0.0",
    author: "Prince",
    countDown: 10,
    role: 2,
    description: {
      en: "Show group members activity report"
    },
    category: "utility",
    guide: {
      en: "{pn}"
    }
  },

  // Track group messages and mentions
  onChat: async function ({ event }) {
    try {
      if (
        !event.threadID ||
        !event.senderID ||
        event.isGroup === false
      ) return;

      const threadID = String(event.threadID);
      const senderID = String(event.senderID);
      const now = Date.now();

      if (!activityData[threadID]) {
        activityData[threadID] = {};
      }

      if (!activityData[threadID][senderID]) {
        activityData[threadID][senderID] = {
          messages: 0,
          mentions: 0,
          mentionedUsers: [],
          firstAt: 0,
          lastAt: 0,
          activeSeconds: 0
        };
      }

      const user = activityData[threadID][senderID];

      if (!user.firstAt) {
        user.firstAt = now;
      }

      // Estimate active time from message intervals.
      // This is not actual online time.
      if (user.lastAt) {
        const gap = (now - user.lastAt) / 1000;

        if (gap <= 300 && gap > 0) {
          user.activeSeconds += gap;
        } else {
          user.activeSeconds += 60;
        }
      } else {
        user.activeSeconds += 60;
      }

      user.messages += 1;
      user.lastAt = now;

      const mentionIDs = Object.keys(event.mentions || {});

      user.mentions += mentionIDs.length;

      for (const id of mentionIDs) {
        if (!user.mentionedUsers.includes(String(id))) {
          user.mentionedUsers.push(String(id));
        }
      }

      await saveData();
    } catch (error) {
      console.error("[ac] Tracking error:", error);
    }
  },

  // Show complete group activity report
  onStart: async function ({ api, event, message }) {
    try {
      const threadID = String(event.threadID);
      const info = await api.getThreadInfo(event.threadID);
      const ids = [
        ...new Set((info.participantIDs || []).map(String))
      ];

      if (!ids.length) {
        return message.reply("❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস কোনো গ্রুপ মেম্বার পাওয়া যায়নি।");
      }

      const groupData = activityData[threadID] || {};

      const members = [];

      for (const uid of ids) {
        let name = "নাম পাওয়া যায়নি";

        try {
          const users = await api.getUserInfo(uid);

          if (users && users[uid] && users[uid].name) {
            name = users[uid].name;
          }
        } catch (error) {
          // Continue even if a name cannot be fetched.
        }

        const data = groupData[uid] || {
          messages: 0,
          mentions: 0,
          mentionedUsers: [],
          firstAt: 0,
          lastAt: 0,
          activeSeconds: 0
        };

        members.push({
          uid,
          name,
          messages: data.messages || 0,
          mentions: data.mentions || 0,
          uniqueMentions: (data.mentionedUsers || []).length,
          firstAt: data.firstAt || 0,
          lastAt: data.lastAt || 0,
          activeSeconds: data.activeSeconds || 0
        });
      }

      members.sort((a, b) => b.messages - a.messages);

      const totalMessages = members.reduce(
        (sum, user) => sum + user.messages,
        0
      );

      const totalMentions = members.reduce(
        (sum, user) => sum + user.mentions,
        0
      );

      const activeMembers = members.filter(
        user => user.messages > 0
      ).length;

      const inactiveMembers = members.length - activeMembers;

      const header =
        `👑 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 BOSS\n` +
        `╭━━━━━━━━━━━━━━━━━━╮\n` +
        `┃ 📊 GROUP ACTIVITY REPORT\n` +
        `╰━━━━━━━━━━━━━━━━━━╯\n\n` +
        `👥 Total Members: ${members.length}\n` +
        `🟢 Recorded Active: ${activeMembers}\n` +
        `💤 No Records: ${inactiveMembers}\n` +
        `💬 Total Messages: ${totalMessages}\n` +
        `🏷️ Total Mentions: ${totalMentions}\n\n`;

      const lines = members.map((user, index) => {
        return (
          `${index + 1}. 👤 ${user.name}\n` +
          `🆔 UID: ${user.uid}\n` +
          `💬 Messages: ${user.messages}\n` +
          `🏷️ Mentions: ${user.mentions}\n` +
          `👥 Different Members Mentioned: ${user.uniqueMentions}\n` +
          `⏱️ Estimated Active Time: ${formatDuration(user.activeSeconds)}\n` +
          `🕒 First Recorded: ${formatTime(user.firstAt)}\n` +
          `📌 Last Message: ${formatTime(user.lastAt)}`
        );
      });

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

      if (current.trim()) {
        chunks.push(current.trimEnd());
      }

      for (let i = 0; i < chunks.length; i++) {
        const footer =
          chunks.length > 1
            ? `\n\n📋 Report ${i + 1}/${chunks.length}`
            : "";

        await message.reply(chunks[i] + footer);
      }
    } catch (error) {
      console.error("[ac] Report error:", error);

      return message.reply(
        "❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 বস Activity Report তৈরি করা যায়নি। " +
        "Bot permission ও console error পরীক্ষা করো।"
      );
    }
  }
};
