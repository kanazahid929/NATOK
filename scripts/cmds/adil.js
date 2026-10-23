module.exports = {
    config: {
        name: "adil",
        version: "1.2",
        author: "acs prince",
        countDown: 5,
        role: 0,
        description: {
            en: "Sequential member mention command - Coded by Acs prince / Biggani Prince Bhai 😎"
        },
        category: "utility",
        guide: {
            en: "   {pn}: Mention members one by one sequentially."
        }
    },

    onStart: async function ({ message, event, api }) {
        const threadID = event.threadID;

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const participantIDs = threadInfo.participantIDs;

            if (!participantIDs || participantIDs.length === 0) return;

            const botID = api.getCurrentUserID();
            const membersToMention = participantIDs.filter(id => id !== botID);

            if (membersToMention.length === 0) return;

            // Loop through each member with a 2-second delay silently
            for (let i = 0; i < membersToMention.length; i++) {
                const userID = membersToMention[i];

                let name = "Member";
                try {
                    const userInfo = await api.getUserInfo(userID);
                    name = userInfo[userID]?.name || "Member";
                } catch (e) {
                    name = "Member";
                }

                await new Promise((resolve) => {
                    setTimeout(async () => {
                        try {
                            await api.sendMessage({
                                body: `@${name}`,
                                mentions: [{ tag: `@${name}`, id: userID }]
                            }, threadID);
                        } catch (err) {}
                        resolve();
                    }, 2000); // 2 seconds delay
                });
            }

        } catch (error) {
            console.error(error);
        }
    }
};
