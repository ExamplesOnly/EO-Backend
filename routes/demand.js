const express = require("express");
const asyncHandler = require("express-async-handler");
const validator = require("../controllers/validator");
const category = require("../controllers/category");
const demand = require("../controllers/demand");
const auth = require("../controllers/auth");
const helper = require("../controllers/helper");

const moduleRouter = express.Router();

const config = {
  name: "demand",
  parentRoute: "/demand",
};

moduleRouter.post(
  "/add",
  asyncHandler(auth.passportJwt),
  validator.addDemand,
  asyncHandler(helper.verify),
  asyncHandler(demand.addDemand)
);

module.exports = {
  moduleRouter,
  config,
};
