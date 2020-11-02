let { body, param } = require("express-validator");
const Users = require("../models").User;
const validator = {};

exports.login = [
  body("password", "Password is not valid.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64."),
  body("email", "Email is not valid.")
    .exists({ checkFalsy: true, checkNull: true })
    .trim()
    .isEmail()
    .isLength({ min: 0, max: 255 })
    .withMessage("Email length must be max 255."),
];

exports.signup = [
  body("firstName", "First name is required.")
    .exists({ checkNull: true })
    .isLength({ min: 3, max: 64 })
    .withMessage("First name length must be between 3 and 64."),
  body("email", "Email is not valid.")
    .exists({ checkFalsy: true, checkNull: true })
    .trim()
    .isEmail()
    .isLength({ min: 0, max: 255 })
    .withMessage("Email length must be max 255.")
    .custom(async (value, { req }) => {
      const user = await Users.findOne({
        where: { email: req.body.email },
      });

      if (user) {
        req.user = user;
      }

      if (user && user.verified) return Promise.reject();
    })
    .withMessage("This email address is already in use."),
  body("password", "Password is not valid.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64."),
];

exports.upload = [
  body("title", "Title is required.")
    .exists({ checkNull: true })
    .isLength({ min: 3, max: 64 })
    .withMessage("Title length must be between 3 and 64."),
];

exports.addCategory = [
  body("title", "Title is required.")
    .exists({ checkNull: true })
    .isLength({ min: 3, max: 40 })
    .withMessage("Title length must be between 3 and 40."),
  // body("thumbUrl", "Thumbnail is required.").exists({ checkNull: true }),
  body("slug", "Slug is required.").exists({ checkNull: true }),
];

exports.addInterests = [
  body("categories", "At least one category is required.")
    .exists({ checkNull: true })
    .custom(async (value, { req }) => {
      try {
        let categoryList = JSON.parse(req.body.categories);
        let categoriesCount = categoryList.categories.length;
        // if (req.categories.categories) {
        // }
        req.categories = categoryList.categories;
        req.categoriesCount = categoriesCount;

        console.log(categoryList, categoriesCount);
      } catch (e) {
        return Promise.reject();
      }
    })
    .withMessage("Wrong request format."),
];
