const os = require("os");

module.exports = {
  config: {
    name: "botstatus",
    aliases: ["bs", "status"],
    version: "2.0.0",
    author: "Prince",
    countDown: 5,
    role: 2,
    description: {
      en: "Royal Cyber Monitor for Goat Bot V2"
    },
    category: "utility",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const formatBytes = (bytes) => {
        if (!Number.isFinite(bytes)) return "N/A";
        const units = ["B", "KB", "MB", "GB", "TB"];
        let size = bytes;
        let index = 0;

        while (size >= 1024 && index < units.length - 1) {
          size /= 1024;
          index++;
        }

        return `${size.toFixed(2)} ${units[index]}`;
      };

      const formatTime = (seconds) => {
        seconds = Math.floor(seconds);
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${days}d ${hours}h ${minutes}m ${secs}s`;
      };

      const uptime = process.uptime();
      const sysUptime = os.uptime();
      const mem = process.memoryUsage();
      const totalRam = os.totalmem();
      const freeRam = os.freemem();
      const usedRam = totalRam - freeRam;
      const cpus = os.cpus();

      const ramPercent = totalRam
        ? ((usedRam / totalRam) * 100).toFixed(1)
        : "N/A";

      const now = new Date().toLocaleString("en-GB", {
        timeZone: "Asia/Dhaka",
        hour12: true
      });

      const lines = [
        "╔════════════════════════════╗",
        "       👑 PRINCE AETHER",
        "    ◈ ROYAL CYBER MONITOR ◈",
        "╚════════════════════════════╝",
        "",
        "〔 ⚡ CORE STATUS 〕",
        "▣ System       : ONLINE",
        `▣ Bot Uptime   : ${formatTime(uptime)}`,
        `▣ Device Uptime: ${formatTime(sysUptime)}`,
        `▣ Node Version : ${process.version}`,
        "",
        "〔 🧠 MEMORY MATRIX 〕",
        `▣ Process RAM  : ${formatBytes(mem.rss)}`,
        `▣ Heap Used    : ${formatBytes(mem.heapUsed)}`,
        `▣ Heap Total   : ${formatBytes(mem.heapTotal)}`,
        `▣ External RAM : ${formatBytes(mem.external)}`,
        `▣ Total RAM    : ${formatBytes(totalRam)}`,
        `▣ Free RAM     : ${formatBytes(freeRam)}`,
        `▣ System RAM   : ${ramPercent}% used`,
        "",
        "〔 🖥️ DEVICE DETAILS 〕",
        `▣ Platform     : ${os.platform()}`,
        `▣ OS           : ${os.type()} ${os.release()}`,
        `▣ Architecture : ${os.arch()}`,
        `▣ CPU Model    : ${cpus[0]?.model || "Unknown"}`,
        `▣ CPU Cores    : ${cpus.length}`,
        "",
        "〔 🛡️ SECURITY 〕",
        "▣ Access Level : Bot Admin Only",
        "▣ Monitor      : Active",
        `▣ Local Time   : ${now}`,
        "",
        "╔════════════════════════════╗",
        "  SILENT POWER • ROYAL SYSTEM",
        "       POWERED BY PRINCE",
        "╚════════════════════════════╝"
      ];

      return message.reply(lines.join("\n"));

    } catch (err) {
      console.error("[PRINCE BOTSTATUS]", err);
      return message.reply(
        "⚠️ ROYAL MONITOR ERROR\n\n" +
        "System information সংগ্রহ করা যায়নি।\n" +
        "Termux console পরীক্ষা করো।"।"
      );
    }
  }
};
