const JWT = require("jsonwebtoken");
const urlBuilder = require("build-url");
const fetch = require("node-fetch");

const {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  addDays,
} = require("date-fns");

class CustomError extends Error {
  constructor(message, statusCode = 500, data) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.data = data;
  }
}

const signToken = (user) =>
  JWT.sign(
    {
      iss: "ApiAuth",
      sub: user.email,
      iat: parseInt((new Date().getTime() / 1000).toFixed(0)),
      exp: parseInt((addDays(new Date(), 7).getTime() / 1000).toFixed(0)),
    },
    process.env.JWT_SECRET
  );

const makeDynamicLongLink = (url) => {
  return urlBuilder(
    `${process.env.DYNAMIC_LINK_SCHEME}://${process.env.DYNAMIC_LINK_DOMAIN}`,
    {
      queryParams: {
        link: url,
        apn: process.env.APP_ANDROID_PACKAGE,
        afl: url,
        ifl: url,
      },
    }
  );
};

const generateDynamicLink = async (url) => {
  return await fetch(
    `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_WEB_API_KEY}`,
    {
      method: "POST",
      body: JSON.stringify({
        longDynamicLink: makeDynamicLongLink(url),
      }),
      headers: { "Content-Type": "application/json" },
    }
  );
};

module.exports = {
  CustomError,
  signToken,
  generateDynamicLink,
};
