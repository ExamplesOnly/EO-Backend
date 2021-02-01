var _ = require("lodash");
const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
const geoip = require("geoip-lite");
const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const { addHours } = require("date-fns");
const { nanoid, customAlphabet } = require("nanoid");
const { OAuth2Client } = require("google-auth-library");
const {
  getUserDataFromGoogle,
  getAccessToken,
  extractUserDataFromGoogle,
} = require("./socialauth");
const mail = require("./mail");
const { signToken, tempToken, CustomError } = require("../utils");

const Users = require("../models").User;
const UserSession = require("../models").UserSession;
const UserVerificationToken = require("../models").UserVerificationToken;

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const client = new OAuth2Client(process.env.GOOGLE_SERVER_CLIENT_ID);
const refreshTokenLength = process.env.REFRESH_TOKEN_LENGTH
  ? process.env.REFRESH_TOKEN_LENGTH
  : 122;

const MAIL_VERIFICATION_EXPIRY = process.env.MAIL_VERIFICATION_EXPIRY_HR
  ? process.env.MAIL_VERIFICATION_EXPIRY_HR
  : 48;
const MAIL_RESET_PASSWORD_EXPIRY = process.env.MAIL_RESET_PASSWORD_EXPIRY_HR
  ? process.env.MAIL_RESET_PASSWORD_EXPIRY_HR
  : 2;

const appleStringList = ["mac", "os x", "iOS"];

const authenticate = (type, error) =>
  async function auth(req, res, next) {
    if (req.user) return next();

    passport.authenticate(type, (err, user) => {
      if (err) return next(err);

      if (!user) {
        throw new CustomError(error, 401);
      }

      console.log(req.originalUrl);
      if (!user.emailVerified && !req.originalUrl.includes("/me")) {
        throw new CustomError(
          "Your email address is not verified. " +
            "Click on signup to get the verification link again.",
          400
        );
      }

      // if (user && user.banned) {
      //   throw new CustomError("You're banned from using ExamplesOnly.", 403);
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

  await mail.awsverification(req.body.email);

  return res.status(201).send({
    status: "success",
    token: signToken(req.body.email),
    message: "Verification email has been sent.",
  });
};

exports.sessionsignup = async (req, res, next) => {
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
      gender: req.body.gender,
      password,
    },
  });

  if (!user)
    throw new CustomError("Could not login. Something went wrong.", 401);

  req.user = user[0];
  req.user.newAccount = true;

  await mail.awsverification(req.body.email);
  next();
};

exports.validateGoogleAccessToken = async (req, res, next) => {
  // Check if access token is present in the request
  if (req.body.accessToken) {
    req.accessToken = req.body.accessToken;
    return next();
  }

  // If access token is not present, auth code is required
  if (!req.body.authCode) throw new CustomError("Invalid request.", 401);

  // get access token using user auth code
  const tokenReq = await getAccessToken(req.body.authCode);
  req.accessToken = tokenReq.access_token;
  return next();
};

// Handle google login
exports.googleLogin = async (req, res, next) => {
  const ticket = await verifyGoogleToken(req.body.idToken);
  if (!ticket) throw new CustomError("Could not signin.", 401);

  const scopeData = await getUserDataFromGoogle(ticket.sub, req.accessToken);
  if (!scopeData) throw new CustomError("Could not signin.", 401);

  const userData = extractUserDataFromGoogle(ticket.getPayload(), scopeData);

  console.log({ p: ticket.getPayload(), scopeData });
  req.userData = userData;
  return next();
};

exports.validateUser = async (req, res, next) => {
  // create user profile if doesnt exists on db
  // return res.send(req.userData);
  const newUser = await Users.findOrCreate({
    where: {
      email: req.userData.email,
    },
    defaults: {
      uuid: nanoid(
        process.env.ACCOUNT_UUID_LENGTH
          ? parseInt(process.env.ACCOUNT_UUID_LENGTH)
          : 10
      ),
      email: req.userData.email,
      firstName: req.userData.fullName,
      // middleName: req.body.middleName,
      // lastName: req.body.lastName,
      gender: req.userData.gender,
      dob: req.userData.dob,
      emailVerified: true,
      googleId: req.userData.googleId,
    },
    raw: true,
  });

  // If user already exists on db
  if (newUser && !newUser[1]) {
    // If the google account is not connected
    // to the user profile
    if (_.isEmpty(newUser.googleId)) {
      // connect google account to the profile
      const updatedUser = await Users.update(
        {
          googleId: req.userData.googleId,
        },
        { where: { email: req.userData.email } }
      );
      console.log("updatedUser", newUser);
      req.user = newUser[0];
      return next();
    } else {
      // user exists and profile connected with google
      req.user = newUser[0];
    }
  } else {
    // new user account creted
    req.user = newUser[0];
    req.user.newAccount = true;
  }

  return next();
};

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
      ],
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
  if (req.useragent.isBot != false && process.env.NODE_ENV == "production")
    throw new CustomError("Invalid request.", 403);

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

  // Get user geo locatio from IP
  const geoLocation = geoip.lookup(userIp);
  if (geoLocation) {
    sessionData.clientIP = userIp;
    sessionData.clientCity = geoLocation.city;
    sessionData.clientRegion = geoLocation.region;
    sessionData.clientCountry = geoLocation.country;
    sessionData.clientLat = geoLocation.ll[0];
    sessionData.clientLong = geoLocation.ll[1];
  }

  if (!req.eoAgent) {
    sessionData.deviceModel = req.useragent.platform;
    sessionData.deviceOS = req.useragent.os;
    sessionData.deviceManufacture = appleStringList.some((el) =>
      req.useragent.os.includes(el)
    )
      ? "Apple"
      : "Unknown";
    sessionData.clientPlatform = req.useragent.browser;
    sessionData.clientVersion = req.useragent.version;
  } else {
    try {
      var eoAgent = JSON.parse(req.eoAgent);
      sessionData.deviceModel = eoAgent.model;
      sessionData.deviceOS = eoAgent.platform;
      sessionData.clientPlatform = "App";
      sessionData.deviceManufacture = eoAgent.manufacture;
      sessionData.clientVersion = eoAgent.eo_version_code;
    } catch (e) {
      sessionData.deviceModel = "Unknown";
      sessionData.deviceOS = "Unknown";
      sessionData.deviceManufacture = "Unknown";
      sessionData.clientVersion = "Unknown";
    }
  }

  sessionData.lastRefreshAt = new Date().getTime();
  sessionData.refreshToken = customAlphabet(alphabet, refreshTokenLength)();

  const session = await UserSession.create(sessionData);

  if (!session)
    throw new CustomError("Could not login. Please contact support.", 500);

  req.session = session;
  return next();
};

exports.signAuthToken = async (req, res) => {
  const accessToken = tempToken(req.user.email);

  const tokenData = {
    status: "success",
    accessToken,
  };

  // If it is a new session, pass the session token
  if (req.session) {
    tokenData.refreshToken = req.session.refreshToken;
  }

  // If it is a new account, pass the newAccount parameter
  if (req.user.newAccount) {
    tokenData.newAccount = true;
  }
  return res.status(200).send(tokenData);
};

exports.refreshAuthToken = async (req, res, next) => {
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

  req.user = user;
  return next();
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

exports.changePassword = async (req, res) => {
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

exports.setPassword = async (req, res) => {
  if (!_.isEmpty(req.user.password))
    throw new CustomError("Invalid Request.", 401);

  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(req.body.password, salt);

  const user = await Users.update(
    { password },
    {
      where: {
        email: req.user.email,
      },
    }
  );

  if (!user) throw new CustomError("Invalid Request.", 500);

  return res.send({ status: "success", message: "Password Updated" });
};

exports.forgotPassword = async (req, res) => {
  const user = await Users.findOne({
    where: {
      email: req.body.email,
    },
    raw: true,
  });

  // email id doesn't exists on our server
  if (!user) return res.send({ status: "success" });

  // generate and save token
  const token = uuidv4();
  const tokenData = await UserVerificationToken.create({
    userId: user.id,
    token,
    expireAt: addHours(new Date(), MAIL_RESET_PASSWORD_EXPIRY).toISOString(),
  });

  // send mail
  mail.sendResetPasswordMail(user, token);

  return res.send({ status: "success" });
};

exports.resetPassword = async (req, res) => {
  // get the token details
  const tokenData = await UserVerificationToken.findOne({
    where: {
      token: req.body.token,
    },
  });
  if (!tokenData) throw new CustomError("Failed to update password");

  // Token is expired
  if (new Date() > tokenData.expireAt)
    if (!tokenData) throw new CustomError("Failed to update password");

  // if (new Date() > tokenData.)
  // get parent user of the specific token
  const user = await tokenData.getUser();
  if (!user) throw new CustomError("Failed to update password");

  // generate the password token
  const salt = await bcrypt.genSalt(12);
  const password = await bcrypt.hash(req.body.password, salt);

  const updatedUser = await user.update({ password });
  if (!updatedUser) throw new CustomError("Failed to update password");

  // delete the token
  await tokenData.destroy();

  return res
    .status(200)
    .send({ status: "success", message: "Password Updated" });
};

exports.clearSession = async (req, res) => {
  const session = await UserSession.findOne({
    where: {
      refreshToken: req.body.refreshToken,
    },
  });

  if (session) {
    session.destroy();
  }

  res.send({ status: "success" });
};
