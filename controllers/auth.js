var _ = require("lodash");
const bcrypt = require("bcryptjs");
const Op = require("sequelize").Op;
const geoip = require("geoip-lite");
const passport = require("passport");
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

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const client = new OAuth2Client(process.env.GOOGLE_SERVER_CLIENT_ID);
const refreshTokenLength = process.env.REFRESH_TOKEN_LENGTH
  ? process.env.REFRESH_TOKEN_LENGTH
  : 122;

const appleStringList = ["mac", "os x", "iOS"];

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

  await mail.verification(req.body.email);

  return res.status(201).send({
    status: "success",
    token: signToken(req.body.email),
    message: "Verification email has been sent.",
  });
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
    }
  } else {
    req.user.newAccount = true;
  }

  // new user account creted or google account already
  // connected to the profile
  req.user = newUser[0];
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
    throw new CustomError("Invalid request.", 401);

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

  if (!user) throw new CustomError("Invalid Request.", 401);

  return res.send({ status: "success", message: "Password Updated" });
};
