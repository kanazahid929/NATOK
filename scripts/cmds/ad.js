module.exports = {
    config: {
        name: "ad",
        version: "2.3",
        author: "Prince",
        countDown: 5,
        role: 0,
        description: {
            en: "Promote or remove group admin (Bot Admin only)"
        },
        category: "group",
        guide: {
            en: "{pn} me | {pn} @mention | {pn} remove @mention"
        }
    },

    onStart: async function ({ message, event, api }) {
        try {
            // Check existing Goat Bot V2 Bot Admins
            const botConfig = global.GoatBot?.config || {};
            const adminBot = botConfig.adminBot || [];
            const senderID = String(event.senderID);

            // Only Bot Admins can use this command
            const isBotAdmin = adminBot.some(
                id => String(id) === senderID
            );

            if (!isBotAdmin) {
                return message.reply(
                    "❌ এই CMD শুধু  আমার আদিল বস ব্যবহার করতে পারবে।"
                );
            }

            const threadID = event.threadID;
            const body = event.body || "";
            const mentions = event.mentions || {};
            const targetIDs = Object.keys(mentions);

            const cleanBody = body
                .replace(/^[!/#]+/, "")
                .trim();

            const isRemove = /^ad\s+remove\b/i.test(cleanBody);

            let targetID;

            // !ad me
            if (/^ad\s+me$/i.test(cleanBody)) {
                targetID = senderID;
            }
            // !ad @mention or !ad remove @mention
            else if (targetIDs.length > 0) {
                targetID = targetIDs[0];
            }
            else {
                return message.reply(
                    "ব্যবহার:\n" +
                    "!ad me — নিজেকে Admin করতে\n" +
                    "!ad @mention — সদস্যকে Admin করতে\n" +
                    "!ad remove @mention — Admin পদ সরাতে"
                );
            }

            const threadInfo = await api.getThreadInfo(threadID);
            const botID = String(api.getCurrentUserID());
            const adminIDs = threadInfo.adminIDs || [];

            const isGroupAdmin = id =>
                adminIDs.some(admin =>
                    String(admin.id || admin) === String(id)
                );

            // Bot must be a group admin
            if (!isGroupAdmin(botID)) {
                return message.reply(
                    "❌ আদিল বস আগে বটকে গ্রুপ Admin করতে হবে।"
                );
            }

            // Do not remove bot's own admin status
            if (isRemove && String(targetID) === botID) {
                return message.reply(
                    "❌ বটের নিজের Admin পদ এই CMD দিয়ে সরানো যাবে না।"
                );
            }

            if (isRemove && !isGroupAdmin(targetID)) {
                return message.reply(
                    "ℹ️ আদিল বস, এই সদস্য আগে থেকেই Admin নন।"
                );
            }

            if (!isRemove && isGroupAdmin(targetID)) {
                return message.reply(
                    "ℹ️ আদিল বস, এই সদস্য আগে থেকেই Admin।" 
                );
            }

            if (typeof api.changeAdminStatus !== "function") {
                return message.reply(
                    "❌ এই বটে Admin পরিবর্তনের API পাওয়া যায়নি।"
                );
            }

            await api.changeAdminStatus(
                threadID,
                targetID,
                !isRemove
            );

            return message.reply(
                isRemove
                    ? "✅ আদিল বস এর নির্দেশে ওনার Admin পদ সরানো হয়েছে।"
                    : "✅ আদিল বস আপনার নির্দেশে Admin পদ দেয়া হয়েছে।"
            );

        } catch (err) {
            console.error("ad command error:", err);

            return message.reply(
                "❌আদিল বস কাজ হয়নি। বটের API ও Admin অনুমতি পরীক্ষা করো।"
            );
        }
    }
};
