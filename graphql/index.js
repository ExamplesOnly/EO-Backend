const { schema } = require("./schema");
const { ApolloServer, gql } = require("apollo-server-express");
const user = require("../controllers/graphql/user");
const { getUserFromToken } = require("../controllers/graphql/auth");

module.exports = new ApolloServer({
  schema,
  context: async ({ req }) => {
    let token = req.headers.authorization || "";
    if (token.includes("Bearer")) token = token.split(" ")[1]; // If it is a Bearer token, extract it

    let user = await getUserFromToken(token);

    return { user };
  },
});
