const JWT = require("jsonwebtoken");
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

module.exports = {
  CustomError,
  signToken,
};
