module.exports = {
  config: {
    name: "k",
    version: "2.0.0",
    author: "Prince",
    countDown: 5,
    role: 2,
    description: {
      en: "Remove selected members by replying to a member list"
    },
    category: "utility",
    guide: {
      en: "{pn} 2.3.4 (reply to member list)"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const reply = event.messageReply;

    if (!reply || !reply.body) {
      return message.reply(
        "❌ বস MEMBER LIST-এর মেসেজে Reply দিয়ে লিখো:\n" +
        "k 3\nঅথবা\nk 2.3.4"
      );
    }

    const entries = [...reply.body.matchAll(
      /^\s*(\d+)\.\s+Name:\s*(.*?)\s*\n\s*UID:\s*(\d+)\s*$/gm
    )];

    if (!entries.length) {
      return message.reply(
        "❌ userid-এর Name ও UID তালিকার মেসেজে Reply করো।"
      );
    }

    const numbers = args.join("").split(/[.,\s]+/)
      .filter(Boolean)
      .map(Number);

    if (
      !numbers.length ||
      numbers.some(n => !Number.isInteger(n) || n < 1 || n > entries.length)
    ) {
      return message.reply(
        `❌ 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 BOSS সিরিয়াল ভুল। তালিকায় ${entries.length} জন আছে।`
      );
    }

    const selected = [...new Set(numbers)].map(n => ({
      number: n,
      name: entries[n - 1][2].trim(),
      uid: entries[n - 1][3]
    }));

    const results = [];

    for (const user of selected) {
      try {
        const info = await api.getThreadInfo(event.threadID);
        const members = info.participantIDs || [];

        if (!members.includes(user.uid)) {
          results.push(`${user.number}. ${user.name}: গ্রুপে নেই`);
          continue;
        }

        await new Promise((resolve, reject) => {
          api.removeUserFromGroup(
            user.uid,
            event.threadID,
            err => err ? reject(err) : resolve()
          );
        });

        results.push(`${user.number}. ${user.name}: রিমুভ করে দিয়েছি`);
      } catch (error) {
        results.push(
          `${user.number}. ${user.name}: কিক ব্যর্থ; Bot permission পরীক্ষা করো`
        );
      }
    }

    return message.reply(
      "📋 𝗣͜͡𝗿𝗶𝗻𝗰𝗲 BOSS KICK REPORT\n\n" + results.join("\n")
    );
  }
};
