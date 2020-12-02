let { body, param, check } = require("express-validator");
const Users = require("../models").User;
const Category = require("../models").Category;
const ExampleDemand = require("../models").ExampleDemand;
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

      if (user && user.emailVerified) return Promise.reject();
    })
    .withMessage("This email address is already in use."),
  body("password", "Password is not valid.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64."),
];

exports.googleSignIn = [
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

      if (user && user.emailVerified) return Promise.reject();
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
  body("categories", "At least one category is required.")
    .exists({ checkNull: true })
    .custom(async (value, { req }) => {
      try {
        let categoryList = JSON.parse(req.body.categories);
        let categoriesCount = categoryList.categories.length;
        req.categories = categoryList.categories;
        req.categoriesCount = categoriesCount;

        console.log("CHECK", categoryList, categoriesCount);
      } catch (e) {
        console.log(e);
        return Promise.reject();
      }
    })
    .withMessage("Wrong request format."),
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

exports.updateProfile = [
  body("firstName", "First name is required.")
    .exists({ checkNull: true })
    .isLength({ min: 3, max: 64 })
    .withMessage("First name length must be between 3 and 64."),
];

exports.addDemand = [
  body("title", "Title is required.")
    .exists({ checkNull: true })
    .isLength({ min: 3, max: 64 })
    .withMessage("Title length must be between 3 and 64."),
  body("description", "Description is required.")
    .exists({ checkNull: true })
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description length must be between 10 and 1000."),
  body("categoryId", "Category is required.")
    .exists({ checkNull: true })
    .custom(async (value, { req }) => {
      const category = await Category.findOne({
        where: { id: req.body.categoryId },
      });

      if (!category) return Promise.reject();
    })
    .withMessage("Category not found."),
];

exports.getDemandVideos = [body("demandId", "DemandId is required")];

exports.isDemandValid = [
  body("demandId", "DemandId is required")
    .exists({ checkNull: true })
    .custom(async (value, { req }) => {
      const demand = await ExampleDemand.findOne({
        where: { uuid: req.body.demandId },
      });
      if (!demand) return Promise.reject();

      req.demand = demand;
    })
    .withMessage("Demand not found."),
];
