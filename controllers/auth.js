const passport = require("passport");
const bcrypt = require("bcryptjs");
const customAlphabet = require("nanoid").customAlphabet;
const mail = require("./mail");
const Op = require("sequelize").Op;
const { signToken, CustomError } = require("../utils");
const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstwxyz",
  process.env.ACCOUNT_UUID_LENGTH ? process.env.ACCOUNT_UUID_LENGTH : 10
);

const Users = require("../models").Users;

const auth = {};

const authenticate = (type, error) =>
  async function auth(req, res, next) {
    if (req.user) return next();

    passport.authenticate(type, (err, user) => {
      console.log("authenticate", err);

      if (err) return next(err);

      if (!user) {
        throw new CustomError(error, 401);
      }

      if (!user.verified) {
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

auth.passportJwt = authenticate("jwt", "Unauthorized.");
auth.passportLocal = authenticate("local", "Login credentials are wrong.");

auth.signupAccess = async (req, res, next) => {
  return next();
  // if (process.env.ALLOW_REGISTRATION) return next();
  // return res
  //   .status(403)
  //   .send({ status: "fail", message: "Registration is not allowed." });
};

auth.signup = async (req, res) => {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = await Users.findOrCreate({
    where: {
      email: req.body.email,
    },
    defaults: {
      uuid: nanoid(),
      email: req.body.email,
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      password,
    },
  });

  await mail.verification(user[0].email);
  return res.status(201).send({
    status: "success",
    token: signToken(user[0]),
    message: "Verification email has been sent.",
  });
};

auth.token = async (req, res) => {
  const token = signToken(req.user);
  return res.status(200).send({
    status: "success",
    token,
  });
};

auth.verify = async (req, res, next) => {
  console.log("verify", req.params.verificationToken);
  if (!req.params.verificationToken) return next();

  const user = await Users.update(
    { verified: true, verification_token: null, verification_expires: null },
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
      token: signToken(user[0]),
      message: "Your account is verified.",
    });
  }

  throw new CustomError("Verification token expired.", 401);
};

module.exports = auth;
