const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const basename = path.basename(__filename);

const routes = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const route = require(path.join(__dirname, file));
    routes[file] = route;
  });

Object.keys(routes).forEach((routeName) => {
  let { config, moduleRouter } = require(path.join(__dirname, routeName));
  router.use(config.parentRoute, moduleRouter);
});

router.get("/", (req, res) => {
  res.json({
    message: "API - 👋🌎",
  });
});

// router.use("/auth", require("./auth"));

module.exports = router;
