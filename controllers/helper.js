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

exports.pagination = (req, res, next) => {
  let bodyLimit = parseInt(req.body.limit);
  let queryLimit = parseInt(req.query.limit);

  let bodyOffset = parseInt(req.body.offset);
  let queryOffset = parseInt(req.query.offset);

  let limit =
    bodyLimit && Number.isInteger(bodyLimit)
      ? bodyLimit > process.env.DATA_PAGINATION_LIMIT
        ? process.env.DATA_PAGINATION_LIMIT
        : bodyLimit
      : queryLimit && Number.isInteger(queryLimit)
      ? queryLimit > process.env.DATA_PAGINATION_LIMIT
        ? process.env.DATA_PAGINATION_LIMIT
        : queryLimit
      : process.env.DATA_PAGINATION_LIMIT;
  let offset =
    bodyOffset && Number.isInteger(bodyOffset)
      ? bodyOffset
      : queryOffset && Number.isInteger(queryOffset)
      ? queryOffset
      : 0;

  req.limit = limit;
  req.offset = offset;

  next();
};

exports.error = (error, req, res, next) => {
  // if (env.isDev) {
  //   signale.fatal(error);
  // }

  if (error instanceof CustomError) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(500).json({
    error: process.env.ERROR_DEBUG ? "An error occurred." : error,
  });
};
