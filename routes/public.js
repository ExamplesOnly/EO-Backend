const express = require("express");
const asyncHandler = require("express-async-handler");

const moduleRouter = express.Router();

const config = {
  name: "video",
  parentRoute: "/video",
};

moduleRouter.get("/", asyncHandler(auth.verify));

module.exports = {
  moduleRouter,
  config,
};
