const express = require("express");
const asyncHandler = require("express-async-handler");
const validator = require("../controllers/validator");
const category = require("../controllers/category");
const auth = require("../controllers/auth");
const helper = require("../controllers/helper");

const moduleRouter = express.Router();

const config = {
  name: "category",
  parentRoute: "/category",
};

moduleRouter.post(
  "/add",
  validator.addCategory,
  asyncHandler(helper.verify),
  asyncHandler(category.add)
);

moduleRouter.post("/update", asyncHandler(category.update));

moduleRouter.get(
  "/list",
  asyncHandler(auth.passportJwt),
  asyncHandler(category.getCategories)
);

moduleRouter.get(
  "/videos/:categorySlug?",
  asyncHandler(auth.passportJwt),
  asyncHandler(category.getCategoryVideos)
);

module.exports = {
  moduleRouter,
  config,
};
