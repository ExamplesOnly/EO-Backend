const signale = require("signale");
const { CustomError } = require("../utils");
const validationResult = require("express-validator").validationResult;

exports.verify = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    throw new CustomError(message, 400);
  }
  return next();
};

exports.error = (error, req, res, next) => {
  if (env.isDev) {
    signale.fatal(error);
  }

  if (error instanceof CustomError) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(500).json({ error: "An error occurred." });
};
