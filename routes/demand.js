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

moduleRouter.get(
  "/list",
  asyncHandler(auth.passportJwt),
  asyncHandler(demand.getDemands)
);

moduleRouter.get(
  "/:demandId/videos",
  asyncHandler(auth.passportJwt),
  asyncHandler(demand.getDemandVideos)
);

moduleRouter.post(
  "/bookmark/add",
  asyncHandler(auth.passportJwt),
  validator.isDemandValid,
  asyncHandler(helper.verify),
  asyncHandler(demand.bookmarkDemand)
);

moduleRouter.post(
  "/bookmark/remove",
  asyncHandler(auth.passportJwt),
  validator.isDemandValid,
  asyncHandler(helper.verify),
  asyncHandler(demand.removeDemandBookmark)
);

module.exports = {
  moduleRouter,
  config,
};
