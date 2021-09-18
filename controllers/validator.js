let { body, param, check } = require("express-validator");
const Users = require("../models").User;
const Category = require("../models").Category;
const ExampleDemand = require("../models").ExampleDemand;
const validator = {};

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

exports.searchAll = [
  body("query", "Query is required").exists({ checkNull: true }),
];
