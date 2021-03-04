const fs = require("fs");
const path = require("path");
const { merge } = require("lodash");
const basename = path.basename(__filename);
const { makeExecutableSchema } = require("apollo-server");

const typeDefs = [];
let resolvers = {};

const Query = `
  type Query {
    _empty: String
  }
`;
typeDefs.push(Query);

// import all schema files
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const { typeDef, resolvers: schemaResolvers } = require(path.join(
      __dirname,
      file
    ));
    typeDefs.push(typeDef);
    resolvers = merge(resolvers, schemaResolvers);
  });

// make executable schema
exports.schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
  
});
