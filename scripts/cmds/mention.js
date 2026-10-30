module.exports = {
  config: {
    name: "mentionreply",
    version: "1.4.0",
    permission: 0,
    credits: "Mim x Saif",
    description: "Auto reply when specific users are mentioned",
    prefix: false,
    category: "auto",
    usages: "",
    cooldowns: 3
  },

  onStart: async function () {
    // Required for proper installation
  },

  onChat: async function({ api, event }) {
    const targetUIDs = ["61595459930726", "61583885560414", "61576321289131"];

    // ✨ Replies in italic small-caps bold style
    const replies = [
      
      "____👀😌\n\n 𝙋𝙍𝙄𝙉𝘾𝙀 ⚠️‍☠   বস এখন বিজি আছে যা বলার আমাকে বল বস অনেক বিজি______\n\n🏴‍☠️⚡",
      "╭────────────◊\n বস কই তুমি দেখো তোমাকে এক বলদা মেনশন করে 😌❤️‍🩹\n╰─────────",
          "এতবার মেনশন না দিয়ে বসের ইনবক্সে সরাসরি চলে যাও আর মেয়ে হলে ইগনোর থাকো😌⚡❤️‍🩹",
    "╭────────────◊\n বস কই তুমি দেখো তোমাকে এক বলদা মেনশন করে 😌❤️‍🩹\n╰─────────🚩🕸️",
   "🕸️👾\n\nমেনশন দিশ না 𝙋𝙍𝙄𝙉𝘾𝙀 বস আমার সাথে বিজি আছে অনেক!!❤️‍🩹😌👀 বারবার মেনশন দিস কেন বস এখন তোকে রিপ্লাই দিবে না বস এখন আমাকে নিয়ে চিপায় বিজি\n⚡🚩",
      "🕸️👀যেকোনো প্রয়োজনে আমার বস 𝙋𝙍𝙄𝙉𝘾𝙀 ভাইরে নক দিন বসের আইডি লিংক নিচে দেওয়া আছে\n\ 🚩\n https://www.facebook.com/profile.php?id=61595459930726",
    ];

    if (!event.mentions || Object.keys(event.mentions).length === 0) return;

    for (const uid of targetUIDs) {
      if (Object.keys(event.mentions).includes(uid)) {
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        return api.sendMessage(randomReply, event.threadID, event.messageID);
      }
    }
  }
};
