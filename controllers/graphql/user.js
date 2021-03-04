const DataLoader = require("dataloader");

const User = require("../../models").User;
const { Sequelize } = require("../../models");

const { VideoController } = require("./video");

exports.userLoader = new DataLoader((userids) => {
  let user = User.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: userids,
      },
    },
  });
  return user;
});

exports.getUserById = async (id) => {
  try {
    const user = await this.userLoader.load(id);

    console.log("getUserById FirstName", user.firstName);
    return {
      ...user.dataValues,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
    };
  } catch (err) {
    throw err;
  }
};
