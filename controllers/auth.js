const passport = require("passport");
const bcrypt = require("bcryptjs");
const mail = require("./mail");
const Op = require("sequelize").Op;
const { signToken, tempToken, CustomError } = require("../utils");
const { nanoid, customAlphabet } = require("nanoid");
const { OAuth2Client } = require("google-auth-library");
const geoip = require("geoip-lite");

const Users = require("../models").User;
const UserSession = require("../models").UserSession;

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const client = new OAuth2Client(process.env.GOOGLE_SERVER_CLIENT_ID);
const refreshTokenLength = process.env.REFRESH_TOKEN_LENGTH
  ? process.env.REFRESH_TOKEN_LENGTH
  : 122;
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

exports.signup = async (req, res) => {
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = await Users.findOrCreate({
    where: {
      email: req.body.email,
    },
    defaults: {
      uuid: nanoid(
        process.env.ACCOUNT_UUID_LENGTH
          ? parseInt(process.env.ACCOUNT_UUID_LENGTH)
          : 10
      ),
      email: req.body.email,
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,

      password,
    },
  });

  if (!user)
    throw new CustomError("Could not login. Please contact support.", 401);

  await mail.verification(req.body.email);

  return res.status(201).send({
    status: "success",
    token: signToken(req.body.email),
    message: "Verification email has been sent.",
  });
};

// exports.googleLogin = async (req, res, next) => {
//   if (!req.params.token) throw new CustomError("Could not signin.", 401);

//   const ticket = await verifyGoogleToken(req.params.token);
//   if (!ticket) throw new CustomError("Could not signin.", 401);
// };

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket;
  } catch (e) {
    return null;
  }
}

exports.token = async (req, res) => {
  const token = signToken(req.user.email);
  return res.status(200).send({
    status: "success",
    token,
  });
};

exports.generateSession = async (req, res, next) => {
  // if (req.useragent.isBot != false)
  //   throw new CustomError("Invalid request.", 401);

  let sessionData = { userId: req.user.id };
  sessionData.isClientApp = req.eoAgent ? true : false;

  // Log user IP and location details
  const userIp = (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    ""
  )
    .split(",")[0]
    .trim();

  console.log(userIp);

  if (
    userIp &&
    userIp.match("\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(.|$)){4}\b")
  ) {
    sessionData.clientIP = userIp;
  }

  // Get user geo locatio from IP
  const geoLocation = geoip.lookup(userIp);
  if (geoLocation) {
    sessionData.clientCity = geoLocation.city;
    sessionData.clientRegion = geoLocation.region;
    sessionData.clientCountry = geoLocation.country;
    sessionData.clientLat = geoLocation.ll[0];
    sessionData.clientLong = geoLocation.ll[1];
  }

  if (!req.eoAgent) {
    sessionData.deviceModel = req.useragent.platform;
    sessionData.deviceOS = req.useragent.os;
    sessionData.deviceManufacture = "unknown";
    sessionData.clientPlatform = req.useragent.browser;
    sessionData.clientVersion = req.useragent.version;
    sessionData.lastRefreshAt = new Date().getTime();
    sessionData.refreshToken = customAlphabet(alphabet, refreshTokenLength)();
  }

  const session = await UserSession.create(sessionData);

  if (!session)
    throw new CustomError("Could not login. Please contact support.", 401);

  req.session = session;
  return next();
};

exports.signAuthToken = async (req, res) => {
  const authToken = tempToken(req.user.email);
  return res.status(200).send({
    status: "success",
    sessionToken: req.session.refreshToken,
    authToken,
  });
};

exports.refreshAuthToken = async (req, res) => {
  const session = await UserSession.findOne({
    where: {
      refreshToken: req.body.refreshToken,
    },
  });

  if (!session) throw new CustomError("", 401);

  const user = await Users.findOne({
    where: { id: session.userId },
    raw: true,
  });

  res.send(session, user);
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
