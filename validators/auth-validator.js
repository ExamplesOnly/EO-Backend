let { body, param, check } = require("express-validator");
const Users = require("../models").User;
const Category = require("../models").Category;
const ExampleDemand = require("../models").ExampleDemand;

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

exports.refreshToken = [
  body("refreshToken", "Invalid request.")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Invalid request."),
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

      if (user) return Promise.reject();
    })
    .withMessage("This email address is already in use."),
  body("password", "Password is not valid.")
    .exists({ checkFalsy: true, checkNull: true })
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64."),
];

exports.googleSignIn = [
  body("idToken", "Invalid request.")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Invalid request."),
  // body("accessToken", "Invalid request.")
  //   .exists({ checkFalsy: true, checkNull: true })
  //   .withMessage("Invalid request."),
];

exports.changePassword = [
  body("password", "Password is invalid.")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Password is invalid.")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64."),
  body("email", "Email is not valid.")
    .exists({ checkFalsy: true, checkNull: true })
    .trim()
    .isEmail()
    .isLength({ min: 0, max: 255 })
    .withMessage("Email length must be max 255."),
  body("newPassword", "New password is invalid.")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("New password is invalid.")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length must be between 8 and 64."),
];
