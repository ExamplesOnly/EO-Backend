let { body, param, check } = require("express-validator");
const User = require("../models").User;

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
