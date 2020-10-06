const express = require("express");

const moduleRouter = express.Router();

const config = {
  name: "auth",
  parentRoute: "/auth",
  middleware: [],
};

moduleRouter.get("/", (req, res) => {
  res.json({
    message: "AUTH API - 🔐🗝",
  });
});

module.exports = {
  moduleRouter,
  config,
};

// module.exports = router;
