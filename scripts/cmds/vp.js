 let autoIntervals = {};
‎let messageLists = {};
‎
‎module.exports = {
‎  config: {
‎    name: "vp",
‎    aliases: [],
‎    version: "1.0",
‎    author: "Siyam Edit",
‎    role: 2,
‎    category: "owner",
‎    description: "Auto send messages every 3 minutes"
‎  },
‎
‎  onStart: async function ({ api, event, args }) {
‎    const action = args[0]?.toLowerCase();
‎    const threadID = args[1];
‎
‎    if (!action || !threadID) {
‎      return api.sendMessage(
‎        "Usage:\nvp start <threadID>\nvp stop <threadID>",
‎        event.threadID
‎      );
‎    }
‎
‎    if (!["start", "stop"].includes(action)) {
‎      return api.sendMessage(
‎        "Are you know this virus ??\nAre you know who Siyam Virus 👀👅💫",
‎        event.threadID
‎      );
‎    }
‎
‎    if (action === "start") {
‎      if (autoIntervals[threadID]) {
‎        return api.sendMessage(
‎          `⚠ Already running in thread ${threadID}`,
‎          event.threadID
‎        );
‎      }
‎
‎      messageLists[threadID] = [
‎        "জয় বাংলা হিন্দু মমিন তোর বুইরা মার ভুদার মধ্যে দিমু হামলা নটি মাগির পোলা 😛",
‎        "তোর মার ভোদার মধ্যে থাবরাইতে থাবড়াইতে জাহান্নামের আগুন লাগাইয়া দিমু হিন্দু মমিন খানকির পোলা 👿",
‎        "আই হিন্দু মমিন নটি মাগির পোলা তুই নাকি করস অনলাইনে পাপড় তোর মারে চুইদা চুইদা দিমু কাপনের কাপড় ☹️",
‎        "কাপনের কাপড় নাকি সাদা ওই হিন্দু মমিন তোর মার ভোদার ভিতর ঢুকাইয়া দিমু আমার বন্ধু সিয়াম এর ধনের মাথা 🥱",
‎        "ঢুকাইতে নাকি মজা বেশি আই কিন্দু মমিন তোর মায়েরে আমি অলটাইম ই পুটকি মারি মাদারচোদ মাগির পোলা 😒",
‎        "আই হিন্দু মমিন নটি মাগির পোলা তুই হইলি ভন্ড বারা কনডম ফাটা জারজ 🤣",
‎        "কিরে হিন্দু মমিন চুদানি মাগির পোলা বারোজে জলে নাকি আগুন 😹",
‎        "বেগুনে আছে নাকি বিচি তোর মার ভোদার মধ্যে ঢুকামু 😆",
‎        "ওই হিন্দু মমিন কেসিতে নাই দার তোর মার ভোদার মধ্যে ঢুকামু হাররর 🤣",
‎        "পকেটে নাই টাকা তোর মার ভোদা চুইদ্দা চুইদ্দা লইয়া জামু ঢাকা 😆"
‎      ];
‎
‎      let index = 0;
‎
‎      autoIntervals[threadID] = setInterval(() => {
‎        api.sendMessage(messageLists[threadID][index], threadID);
‎        index++;
‎        if (index >= messageLists[threadID].length) index = 0;
‎      }, 3 * 60 * 1000); // 3 minutes
‎
‎      return api.sendMessage(
‎        `✅ Auto messages started in thread ${threadID}`,
‎        event.threadID
‎      );
‎    }
‎
‎    if (action === "stop") {
‎      if (!autoIntervals[threadID]) {
‎        return api.sendMessage(
‎          `⚠ No auto message running in thread ${threadID}`,
‎          event.threadID
‎        );
‎      }
‎
‎      clearInterval(autoIntervals[threadID]);
‎      delete autoIntervals[threadID];
‎      delete messageLists[threadID];
‎
‎      return api.sendMessage(
‎        `🛑 Auto messaging stopped in thread ${threadID}`,
‎        event.threadID
‎      );
‎    }
‎  }
‎};
