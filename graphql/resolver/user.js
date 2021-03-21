const User = require("../../models").User;
const { ApolloError } = require("apollo-server");

module.exports = {
  Query: {
    async User(parent, args, context, info) {
      let user = await User.findOne({
        where: { uuid: args.uuid },
      });

      if (!user) return new ApolloError("User not found");

      return user;
    },
  },
};
