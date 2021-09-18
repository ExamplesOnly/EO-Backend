const Video = require("../models").Video;
const User = require("../models").User;
const { Sequelize } = require("../models");

exports.searchAll = async (req, res) => {
  var query = req.body.query;
  var queryTime = Date.now();

  var videoList = await Video.findAll({
    where: {
      [Sequelize.Op.or]: [
        {
          title: {
            [Sequelize.Op.substring]: query,
          },
        },
        {
          description: {
            [Sequelize.Op.substring]: query,
          },
        },
      ],
    },
    limit: req.limit,
    offset: req.offset,
  });

  var userList = await User.findAll({
    where: {
      [Sequelize.Op.or]: [
        {
          firstName: {
            [Sequelize.Op.substring]: query,
          },
        },
        {
          middleName: {
            [Sequelize.Op.substring]: query,
          },
        },
        {
          lastName: {
            [Sequelize.Op.substring]: query,
          },
        },
      ],
    },
    limit: req.limit,
    offset: req.offset,
  });

  console.log("videoList", videoList);

  res.send({
    query,
    queryTime,
    data: {
      userList,
      videoList,
    },
  });
};