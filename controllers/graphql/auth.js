var {
  verify: jwtVerify,
  TokenExpiredError,
  JsonWebTokenError,
} = require("jsonwebtoken");
const { AuthenticationError, ApolloError } = require("apollo-server");
const serverReturnCode = require("../../utils/serverreturncode");

const User = require("../../models").User;

/**
 * Verify the JWT token provided by user.
 *
 * @param {String} token - The JWT token which need to be verified.
 *                         The token must not be null.
 */
exports.verifyToken = (token) => {
  if (!token)
    throw new ApolloError("Invalid Token", serverReturnCode.AUTH_TOKEN_INVALID);
  try {
    var tokenVerify = jwtVerify(token, process.env.JWT_SECRET);
    return tokenVerify;
  } catch (e) {
    if (e instanceof TokenExpiredError)
      throw new ApolloError(
        "Invalid Token",
        serverReturnCode.AUTH_TOKEN_EXPIRED
      );
    else
      throw new ApolloError(
        "Invalid Token",
        serverReturnCode.AUTH_TOKEN_INVALID
      );
  }
};

/**
 * Get user profile data from JWT token.
 * It only returns user data if the token is valid and not expired.
 *
 * @param {String} token - The JWT token which need to be verified.
 *                         The token must not be null.
 */
exports.getUserFromToken = async (token) => {
  var tokenData = this.verifyToken(token);

  const user = await User.findOne({
    where: { email: tokenData.sub },
    raw: true,
  });

  if (!user)
    throw new ApolloError("Invalid Token", serverReturnCode.AUTH_TOKEN_INVALID);

  return user;
};
