const Users = require("../models").User;
const Videos = require("../models").Video;
const VideoMeta = require("../models").VideoMeta;
const { sequelize } = require("../models");

exports.userList = async (req, res) => {
  const users = Users.findAll();
  res.send(users);
};

exports.deleteUser = async (req, res) => {};

exports.xTotalStat = async (req, res) => {
  const userCount = await Users.count({
    distinct: true,
    col: "id",
  });

  const videoCount = await Videos.count({
    distinct: true,
    col: "id",
  });

  const [results, metadata] = await sequelize.query(
    `SELECT sum(bow) AS totalBowCount,` +
      `sum(view) AS totalViewCount,` +
      `sum(totalBookmark) AS totaBookmarkCount,` +
      `sum(duration) AS totalVideoDuration,` +
      `sum(totalPlayTime) AS totalVideoPlayTime ` +
      `FROM VideoMeta;`
  );

  const data = results[0];

  res.send({ userCount, videoCount, data });
};
