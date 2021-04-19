const DataLoader = require("dataloader");

const User = require("../../models").User;
const Video = require("../../models").Video;
const { Sequelize, sequelize } = require("../../models");

exports.userLoader = new DataLoader((userids) => {
  let user = User.findAll({
    where: {
      id: {
        [Sequelize.Op.in]: userids,
      },
    },
    order: [[sequelize.fn("field", sequelize.col("id"), userids)]],
  });
  return user;
});

exports.getUserById = async (id) => {
  try {
    const user = await this.userLoader.load(id);
    return {
      ...user.dataValues,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
    };
  } catch (err) {
    throw err;
  }
};

exports.getUserByUuid = async (uuid) => {
  try {
    let user = User.findOne({
      where: {
        uuid: uuid,
      },
      include: [
        {
          model: Video,
        },
      ],
    });

    return {
      ...user.dataValues,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
    };
  } catch (err) {
    throw err;
  }
};
