function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode =
    err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.LOG_LEVEL === "production" ? "🥞" : err.stack,
  });
}

module.exports = {
  notFound,
  errorHandler,
};
