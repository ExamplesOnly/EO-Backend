exports.typeDef = `
  type Category {
    id: Int!
    slug: String!
    title: String!
    thumbUrl: String
  }
`;

exports.resolvers = {
  Query: {},
};
