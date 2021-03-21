const typeDefs = require("./schema");
const resolvers = require("./resolver");
const { ApolloServer, gql } = require("apollo-server-express");
const user = require("../controllers/graphql/user");
const { getUserFromToken } = require("../controllers/graphql/auth");
const { makeExecutableSchema } = require("apollo-server");

// make executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = new ApolloServer({
  schema,
  context: async ({ req }) => {
    let token = req.headers.authorization || "";
    if (token.includes("Bearer")) token = token.split(" ")[1]; // If it is a Bearer token, extract it

    let user = await getUserFromToken(token);

    return { user };
  },
});
