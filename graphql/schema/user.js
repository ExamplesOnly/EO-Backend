const User = require("../../models").User;
const { ApolloError } = require("apollo-server");

exports.typeDef = `
  extend type Query {
    getUser(uuid: String): User
  }

  type User {
    uuid: String!
    userId: String
    email: String!
    firstName: String!
    middleName: String
    lastName: String
    bio: String
    dob: String
    gender: String
    phoneNumber: String
    countryCode: String
    profileImage: String
    coverImage: String
    emailVerified: Boolean!
    blocked: Boolean
    googleId: Boolean
  }

  input UserInput {
    userId: String!
    email: String!
    firstName: String!
    middleName: String
    lastName: String
    password: String
  }
`;

exports.resolvers = {
  Query: {
    async getUser(parent, args, context, info) {
      console.log(parent, args, context, info);
      let user = await User.findOne({
        where: { uuid: args.uuid },
      });

      if (!user) return new ApolloError("User not found");

      return user;
    },
  },
  // User: {
  //   firstName: () => {},
  // },
};
