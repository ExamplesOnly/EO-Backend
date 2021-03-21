const fs = require("fs");
const path = require("path");
const { merge } = require("lodash");
const basename = path.basename(__filename);

let resolvers = {};

// import all schema files
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const schemaResolvers = require(path.join(__dirname, file));
    resolvers = merge(resolvers, schemaResolvers);
  });

module.exports = resolvers;

// exports.schema = makeExecutableSchema({
//   typeDefs: typeDefs,
//   resolvers: resolvers,
// });
