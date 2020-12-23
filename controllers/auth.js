const passport = require("passport");
const bcrypt = require("bcryptjs");
const mail = require("./mail");
const Op = require("sequelize").Op;
const { signToken, CustomError } = require("../utils");
const { nanoid } = require("nanoid");

const Users = require("../models").User;

const auth = {};

const authenticate = (type, error) =>
  async function auth(req, res, next) {
    if (req.user) return next();

    passport.authenticate(type, (err, user) => {
      if (err) return next(err);

      if (!user) {
        throw new CustomError(error, 401);
      }

      if (!user.emailVerified) {
        throw new CustomError(
          "Your email address is not verified. " +
            "Click on signup to get the verification link again.",
          400
        );
      }

      // if (user && user.banned) {
      //   throw new CustomError("You're banned from using this website.", 403);
      // }

      if (user) {
        req.user = {
          ...user,
          // admin: utils.isAdmin(user.email),
        };
        return next();
      }
      return next();
    })(req, res, next);
  };

exports.passportJwt = authenticate("jwt", "Unauthorized.");
exports.passportLocal = authenticate("local", "Login credentials are wrong.");

exports.signupAccess = async (req, res, next) => {
  return next();
  // if (process.env.ALLOW_REGISTRATION) return next();
  // return res
  //   .status(403)
  //   .send({ status: "fail", message: "Registration is not allowed." });
};

exports.signup = async (req, res) => {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = await Users.findOrCreate({
    where: {
      email: req.body.email,
    },
    defaults: {
      uuid: nanoid(
        process.env.ACCOUNT_UUID_LENGTH ? process.env.ACCOUNT_UUID_LENGTH : 10
      ),
      email: req.body.email,
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,

      password,
    },
  });

  await mail.verification(req.body.email);

  return res.status(201).send({
    status: "success",
    token: signToken(req.body.email),
    message: "Verification email has been sent.",
  });
};

exports.googleLogin = async (req, res) => {};

exports.token = async (req, res) => {
  const token = signToken(req.user.email);
  return res.status(200).send({
    status: "success",
    token,
  });
};

exports.verify = async (req, res, next) => {
  if (!req.params.verificationToken) return next();

  const user = await Users.update(
    {
      emailVerified: true,
      verification_token: null,
      verification_expires: null,
    },
    {
      where: {
        verification_token: req.params.verificationToken,
        verification_expires: {
          [Op.gt]: new Date().toISOString(),
        },
      },
    }
  );

  if (user && user[0]) {
    return res.status(201).send({
      status: "success",
      token: signToken(user[0].email),
      message: "Your account is verified.",
    });
  }

  throw new CustomError("Verification token expired.", 401);
};

exports.changePassword = async (req, res, next) => {
  const salt = await bcrypt.genSalt(12);
  const updatedPassword = await bcrypt.hash(req.body.newPassword, salt);

  const user = await Users.update(
    { password: updatedPassword },
    {
      where: {
        email: req.body.email,
      },
    }
  );

  if (!user) throw new CustomError("Failed to update password");

  return res
    .status(200)
    .send({ status: "success", message: "Password Updated" });
};
