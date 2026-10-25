const axios = require("axios");
const moment = require("moment-timezone");

let autoIntervals = {};
let sentFinalIftar = {};

module.exports = {
  config: {
    name: "rm",
    version: "3.1",
    author: "prince0098",
    role: 2,
    category: "owner",
    description: "Auto Sehri + Iftar Reminder"
  },

  onStart: async function ({ api, event, args }) {

    const action = args[0]?.toLowerCase();
    const threadID = args[1];

    if (!action || !threadID) {
      return api.sendMessage(
        "Usage:\nvp start <threadID>\nvp stop <threadID>",
        event.threadID
      );
    }

    const city = "Dhaka";
    const country = "Bangladesh";
    const timezone = "Asia/Dhaka";

    if (action === "start") {

      if (autoIntervals[threadID]) {
        return api.sendMessage(`⚠ Already running in ${threadID}`, event.threadID);
      }

      sentFinalIftar[threadID] = false;

      api.sendMessage(`✅ Sehri + Iftar system activated in ${threadID}`, event.threadID);

      autoIntervals[threadID] = setInterval(async () => {
        try {

          const response = await axios.get(
            `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=1`
          );

          const fajrTime = response.data.data.timings.Fajr;
          const maghribTime = response.data.data.timings.Maghrib;

          const now = moment().tz(timezone);
          const fajrMoment = moment.tz(fajrTime, "HH:mm", timezone);
          const maghribMoment = moment.tz(maghribTime, "HH:mm", timezone);

          const sehriStart = moment(fajrMoment).subtract(1, "hour");
          const iftarStart = moment(maghribMoment).subtract(2, "hours");

          /* ================== SEHRI SYSTEM ================== */

          if (now.isBetween(sehriStart, fajrMoment) && now.minute() % 5 === 0) {

            api.sendMessage(
`🝐꯭𐏓꯭꯭ ⃪💜 ⃪͢𝗔𝗦𝗦𝗔𝗟𝗔𝗠𝗨𝗔𝗟𝗔𝗜𝗞𝗨𝗠💥

-> সেহেরীর সময় অতি নিকটে 💞 আপনারা দ্রুত ঘুম থেকে জেগে উঠুন এবং সাহরী করূন🖤✨

🕒 এখন সময়: ${now.format("hh:mm A")}
🌙 সেহরির শেষ সময়: ${fajrTime}`,
              threadID
            );

          }

          /* ================== IFTAR SYSTEM ================== */

          if (now.isBetween(iftarStart, maghribMoment) && now.minute() % 10 === 0) {

            const minutesLeft = maghribMoment.diff(now, "minutes");

            api.sendMessage(
`🝐꯭𐏓꯭꯭ ⃪💜 ⃪͢𝗔𝗦𝗦𝗔𝗟𝗔𝗠𝗨𝗔𝗟𝗔𝗜𝗞𝗨𝗠💥😊

- ইফতারের সময় অতি নিকটে 💞🥰
আজকে ইফতারের শেষ সময় ${maghribTime}

🕑 এখন সময়: ${now.format("hh:mm A")}
⏳ ইফতারের আর মাত্র ${minutesLeft} মিনিট বাকি আছে

আপনারা সবাই দোয়া ইসতেগফার পাঠ করূন🖤☺️
اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ। 🥰✨

আল্লাহ আমাদের সবাইকে মাফ করুক আমিন 🖤💥🥰`,
              threadID
            );

          }

          /* ======= FINAL IFTAR NOTIFICATION ======= */

          if (!sentFinalIftar[threadID] &&
              now.format("HH:mm") === maghribMoment.format("HH:mm")) {

            sentFinalIftar[threadID] = true;

            api.sendMessage(
`🝐꯭ ✨💞💥

-  প্রিয় মুসলমান ভাই ও বোনেরা ইফতারের সময় হয়ে গেছে ✨🕑

আপনারা সবাই ইফতারের দোয়া পাঠ করুন ✨🥰

😍☺️আল্লাহুম্মা লাকা ছুমতু ওয়া আলা রিযক্বিকা ওয়া আফতারতু বিরাহমাতিকা ইয়া আরহামার রাহিমিন।💞✨

সবাই ইফতার করুন 🖤☺️`,
              threadID
            );
          }

        } catch (err) {
          console.log(err);
        }

      }, 60 * 1000); // প্রতি ১ মিনিটে চেক

    }

    if (action === "stop") {

      if (!autoIntervals[threadID]) {
        return api.sendMessage(`⚠ No system running in ${threadID}`, event.threadID);
      }

      clearInterval(autoIntervals[threadID]);
      delete autoIntervals[threadID];
      delete sentFinalIftar[threadID];

      return api.sendMessage(`🛑 System stopped in ${threadID}`, event.threadID);
    }

  }
};
