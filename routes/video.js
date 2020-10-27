const express = require("express");
const asyncHandler = require("express-async-handler");
const validator = require("../controllers/validator");
const video = require("../controllers/video");
const helper = require("../controllers/helper");

const moduleRouter = express.Router();

const config = {
  name: "public",
  parentRoute: "/video",
};

moduleRouter.post("/upload", video.uploadS3.single("file"), (req, res) => {
  res.send(req.file);
});

module.exports = {
  moduleRouter,
  config,
};
