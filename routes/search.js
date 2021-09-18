const express = require("express");
const asyncHandler = require("express-async-handler");
const auth = require("../controllers/auth");
const search = require("../controllers/search");
const validator = require("../controllers/validator");
const helper = require("../controllers/helper");

const moduleRouter = express.Router();

const config = {
  name: "search",
  parentRoute: "/search",
};

moduleRouter.get(
  "/all",
  asyncHandler(auth.passportJwt),
  validator.searchAll,
  asyncHandler(helper.verify),
  asyncHandler(search.searchAll)
);

module.exports = {
  moduleRouter,
  config,
};
