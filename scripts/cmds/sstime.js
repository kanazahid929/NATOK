module.exports = {
    config: {
        name: "sstime",
        version: "2.0",
        author: "siyamxxxx72",
        countDown: 5,
        role: 0,
        description: {
            en: "siyamNotice"
        },
        category: "group",
        guide: {
            en: "siyamGuide"
        }
    },

    onStart: async function ({ message, event, api }) {
        const siyamThreadID = event.threadID;

        try {
            const siyamThreadInfo = await api.getThreadInfo(siyamThreadID);
            const siyamParticipantIDs = siyamThreadInfo.participantIDs;

            if (!siyamParticipantIDs || siyamParticipantIDs.length === 0) {
                return message.reply("siyamError");
            }

            const siyamBotID = api.getCurrentUserID();
            const siyamMembersToMention = siyamParticipantIDs.filter(siyamID => siyamID !== siyamBotID);

            let siyamBaseText = 
`📢 HELLO EVERYONE! 👋

━━━━━━━━━━━━━━━━━━━━
🔥 SS TIME STARTING NOW 🔥
━━━━━━━━━━━━━━━━━━━━

আসসালামু আলাইকুম! ❤

⚠ সকল মেম্বারদের দৃষ্টি আকর্ষণ করছি!

🕘 SS টাইম শুরু হয়েছে।
সবাই তাড়াতাড়ি কলে চলে আসেন। 📞

😡 যারা কলে আসবেন না, তাদের কিন্তু কিক মেরে দেওয়া হবে!
তাই সবাই সময়মতো কলে চলে আসেন। ❤

━━━━━━━━━━━━━━━━━━━━
👑 আদেশক্রমে....!
━━━━━━━━━━━━━━━━━━━━

💠 PORICHALOK = আদিল
💠 প্রতিষ্ঠাতা = অনিক
💠 CEO SIR = শুভ্র চৌধুরী

❤ PLATONIC LOVE ADDA BOX ❤

`;

            let siyamBody = siyamBaseText;
            let siyamMentions = [];

            for (const siyamUserID of siyamMembersToMention) {
                let siyamName = "siyamMember";
                try {
                    const siyamUserInfo = await api.getUserInfo(siyamUserID);
                    siyamName = siyamUserInfo[siyamUserID]?.name || "siyamMember";
                } catch (siyamErr) {
                    siyamName = "siyamMember";
                }

                const siyamTagString = `@${siyamName} `;
                const siyamFromIndex = siyamBody.length;
                siyamBody += siyamTagString;

                siyamMentions.push({
                    tag: siyamTagString.trim(),
                    id: siyamUserID,
                    fromIndex: siyamFromIndex
                });
            }

            await api.sendMessage({
                body: siyamBody,
                mentions: siyamMentions
            }, siyamThreadID);

        } catch (siyamMainErr) {
            console.error(siyamMainErr);
            return message.reply("siyamFailed");
        }
    }
};
