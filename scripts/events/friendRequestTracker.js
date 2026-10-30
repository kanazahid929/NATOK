"use strict";

const fs = require("fs-extra");
const path = require("path");

const filePath = path.join(
  process.cwd(),
  "data",
  "friend-requests.json"
);

function readRequests() {
  fs.ensureDirSync(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeJsonSync(filePath, []);
  }
  return fs.readJsonSync(filePath);
}

module.exports = {
  config: {
    name: "friendRequestTracker",
    eventType: ["friend_request_received"],
    version: "1.0.0",
    author: "Prince"
  },

  onStart: async function ({ event }) {
    const uid = String(event.actorFbId || "");
    if (!uid) return;

    const requests = readRequests();

    if (!requests.some(item => item.uid === uid)) {
      requests.push({
        uid,
        receivedAt: Date.now()
      });

      fs.writeJsonSync(filePath, requests, {
        spaces: 2
      });
    }
  }
};
