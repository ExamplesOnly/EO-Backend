const express = require("express");
const asyncHandler = require("express-async-handler");
const admin = require("../controllers/admin");

const db = require("../models");

const moduleRouter = express.Router();

const config = {
  name: "admin",
  parentRoute: "/admin",
};

moduleRouter.post("/resetdb", (req, res) => {
  db.sequelize.sync({ force: true }).then(() => {
    res.send("DB Reset successful");
  });
});

moduleRouter.get("/userlist", asyncHandler(admin.userList));

moduleRouter.post("/deleteuser", asyncHandler(admin.deleteUser));

moduleRouter.get("/xtotalstat", asyncHandler(admin.xTotalStat));

module.exports = {
  moduleRouter,
  config,
};
