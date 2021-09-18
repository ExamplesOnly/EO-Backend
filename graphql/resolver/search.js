const searchController = require("../../controllers/graphql/search");

module.exports = {
  Query: {
    // async Search(parent, args, context, info) {
    //   let searchData = await searchController.searchAll(
    //     args.query,
    //     args.limit,
    //     args.offset
    //   );
    //   return searchData;
    //   return null;
    // },
    async SearchUser(parent, args, context, info) {
      let searchData = await searchController.SearchUser(
        args.query,
        args.limit,
        args.offset
      );
      console.log("SearchUserResolver", searchData);
      return searchData;
      return null;
    },
    async SearchVideo(parent, args, context, info) {
      let searchData = await searchController.SearchVideo(
        args.query,
        args.limit,
        args.offset
      );
      console.log("SearchVideoResolver", searchData);
      return searchData;
      return null;
    },
  },
};
