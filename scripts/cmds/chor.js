const fs = require("fs-extra");
const Canvas = require("canvas");
const jimp = require("jimp");
const request = require("node-superfetch");

module.exports = {
  config: {
    name: "chor",
    version: "1.0.3",
    author: "siyam",
    countDown: 5,
    role: 0,
    description: {
      en: "Scooby Doo meme"
    },
    category: "Picture",
    guide: {
      en: "{pn} @tag"
    }
  },

  circle: async function (image) {
    let img = await jimp.read(image);
    img.circle();
    return await img.getBufferAsync("image/png");
  },

  onStart: async function ({ api, event }) {
    try {
      // Get the first mentioned user or fallback to sender
      const mentionID = Object.keys(event.mentions)[0] || event.senderID;
      const mentionName = Object.values(event.mentions)[0] || "You";
      const out = __dirname + "/cache/chor.png";

      // Create canvas
      const canvas = Canvas.createCanvas(500, 670);
      const ctx = canvas.getContext("2d");

      // Load background
      const bg = await Canvas.loadImage("https://i.imgur.com/ES28alv.png");

      // Load avatar
      const avatarReq = await request.get(
        `https://graph.facebook.com/${mentionID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const avatar = await this.circle(avatarReq.body);

      // Draw background and avatar
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(await Canvas.loadImage(avatar), 48, 410, 111, 111);

      // Save canvas
      fs.writeFileSync(out, canvas.toBuffer());

      // Construct message with proper tag
      const msg = {
        body: `বলদা মুরগী'র ডিম চুরি করতে গিয়ে ধরা খাই'ছে _______👀🌩️\n\n ${mentionName}\n\n_______ 😒😾 একদম ডাইরেক্ট ধরা খাইলি আদিল বসের কাছে 😎👑`,
        mentions: [
          {
            tag: `@${mentionName}`, // This is what will be visible
            id: mentionID
          }
        ],
        attachment: fs.createReadStream(out)
      };

      // Send message
      api.sendMessage(msg, event.threadID, () => fs.unlinkSync(out), event.messageID);

    } catch (e) {
      api.sendMessage(String(e), event.threadID);
    }
  }
};
