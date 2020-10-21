const express = require("express");
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

module.exports = {
  moduleRouter,
  config,
};
