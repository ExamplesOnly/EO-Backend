const admin = require("firebase-admin");
const fs = require("fs");
var config = JSON.parse(fs.readFileSync("firebase-admin.json"));

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(config),
});

module.exports = firebaseAdmin;
