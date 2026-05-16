const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');

module.exports = {
  config: {
    name: "acslogo",
    version: "1.2",
    author: "Mesbah Saxx",
    countDown: 3,
    role: 0,
    description: { en: "Generate ACS style logo images with static avatar slices." },
    category: "canvas",
    guide: { en: "{pn} <avatarUrl or reply with an image>" }
  },

  onStart: async function ({ message, event, args }) {
    try {
      let avatarUrl = args[0];
      if (!avatarUrl && event.messageReply && event.messageReply.attachments?.[0]?.url) {
        avatarUrl = event.messageReply.attachments[0].url;
      }
      avatarUrl = avatarUrl || 'https://i.ibb.co/5hmJkLP9/image0.jpg';

      const logoUrl = 'https://i.ibb.co/gF4K2Vfc/image0.jpg';

      const [avatarRes, logoRes] = await Promise.all([
        axios.get(avatarUrl, { responseType: 'arraybuffer' }),
        axios.get(logoUrl, { responseType: 'arraybuffer' })
      ]);

      const img = await loadImage(Buffer.from(avatarRes.data));
      const logo = await loadImage(Buffer.from(logoRes.data));

      const bgSize = 800;
      const upscaleFactor = 2;
      const logoSize = bgSize * 0.12;

      const attachments = [];

      const currentRatio = img.width / img.height;
      const desiredRatio = 2 / 3;

      if (Math.abs(currentRatio - desiredRatio) < 0.01) {
        const canvas = createCanvas(bgSize, bgSize);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#01321f';
        ctx.fillRect(0, 0, bgSize, bgSize);

        const scale = bgSize / img.height;
        const targetWidth = img.width * scale;
        const dx = (bgSize - targetWidth) / 2;

        ctx.drawImage(img, 0, 0, img.width, img.height, dx, 0, targetWidth, bgSize);

        const logoX = bgSize * 0.10;
        const logoY = bgSize * 0.12;
        const logoRadius = logoSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoRadius, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        const tempBuffer = canvas.toBuffer('image/png');
        const upscaledBuffer = await sharp(tempBuffer)
          .resize(bgSize * upscaleFactor, bgSize * upscaleFactor)
          .png()
          .toBuffer();

        const fileName = `acs_logo.png`;
        fs.writeFileSync(fileName, upscaledBuffer);
        attachments.push(fs.createReadStream(fileName));
      } else {
        const partCount = 4;
        const partHeight = img.height;
        const partWidth = partHeight * desiredRatio;

        const maxStartX = img.width - partWidth;

        for (let i = 0; i < partCount; i++) {
          const canvas = createCanvas(bgSize, bgSize);
          const ctx = canvas.getContext('2d');

          ctx.fillStyle = '#01321f';
          ctx.fillRect(0, 0, bgSize, bgSize);

          const sx = i * (partWidth / partCount); // static slices from left to right
          const sy = 0;
          const sw = partWidth;
          const sh = partHeight;

          const scale = bgSize / sh;
          const targetWidth = sw * scale;
          const dx = (bgSize - targetWidth) / 2;

          ctx.drawImage(img, sx, sy, sw, sh, dx, 0, targetWidth, bgSize);

          const logoX = bgSize * 0.10;
          const logoY = bgSize * 0.12;
          const logoRadius = logoSize / 2;

          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX + logoRadius, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          ctx.restore();

          const tempBuffer = canvas.toBuffer('image/png');
          const upscaledBuffer = await sharp(tempBuffer)
            .resize(bgSize * upscaleFactor, bgSize * upscaleFactor)
            .png()
            .toBuffer();

          const fileName = `acs_logo_part_${i + 1}.png`;
          fs.writeFileSync(fileName, upscaledBuffer);
          attachments.push(fs.createReadStream(fileName));
        }
      }

      await message.reply({ attachment: attachments });
      attachments.forEach(stream => fs.unlinkSync(stream.path));

    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to generate ACS logo.");
    }
  }
};