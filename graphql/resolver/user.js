const User = require("../../models").User;
const { ApolloError } = require("apollo-server");
const userController = require("../../controllers/graphql/user");
const videoController = require("../../controllers/graphql/video");

module.exports = {
  Query: {
    async User(parent, args, context, info) {
      console.log("UserResolver", args);
      let user = await userController.getUserByUuid(args.uuid);

      if (!user) return new ApolloError("User not found");

      return user;
    },
  },
  User: {
    async videos(parent, args, context, info) {
      console.log("UserResolver", parent, args);
      var videos = await videoController.getVideoByUser(
        parent.id,
        args.limit,
        args.offset
      );

      return videos;
    },
  },
};
