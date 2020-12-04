const ExampleDemand = require("../models").ExampleDemand;
const ExampleBookmark = require("../models").ExampleBookmark;
const User = require("../models").User;
const Category = require("../models").Category;
const Video = require("../models").Video;
const { sequelize } = require("../models");
const { nanoid } = require("nanoid");
const { CustomError } = require("../utils");

exports.addDemand = async (req, res) => {
  let deamndId = nanoid();

  const demand = await ExampleDemand.findOrCreate({
    where: {
      uuid: deamndId,
    },
    defaults: {
      uuid: deamndId,
      title: req.body.title,
      description: req.body.description,
      categoryId: req.body.categoryId,
      userId: req.user.id,
    },
  });

  if (!demand) throw new CustomError("");

  return res.status(200).send(demand[0]);
};

exports.getDemands = async (req, res) => {
  const demands = await ExampleDemand.findAll({
    attributes: [
      "uuid",
      "title",
      "description",
      [sequelize.fn("COUNT", sequelize.col("Videos.id")), "videoCount"],
      // [sequelize.fn("COUNT", sequelize.findAll({})), "isBookmarked"],
    ],
    group: ["uuid"],
    include: [
      {
        model: User,
        attributes: ["uuid", "email", "firstName", "profileImage"],
      },
      {
        model: Category,
        attributes: ["title"],
      },
      {
        model: Video,
        attributes: [
          "videoId",
          "size",
          "duration",
          "height",
          "width",
          "title",
          "description",
          "url",
          "thumbUrl",
          "createdAt",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).send(demands);
};

exports.getDemandVideos = async (req, res) => {
  const demand = await ExampleDemand.findOne({
    where: {
      uuid: req.params.demandId,
    },
    raw: true,
  });

  if (!demand) throw new CustomError("Demand not found", 400);

  const videos = await Video.findAll({
    where: {
      demandId: demand.id,
    },
    attributes: [
      "videoId",
      "size",
      "duration",
      "height",
      "width",
      "title",
      "description",
      "url",
      "thumbUrl",
      "createdAt",
    ],
    include: [
      {
        model: User,
        // as: "user",
        attributes: ["uuid", "email", "firstName", "lastName", "profileImage"],
      },
      {
        model: Category,
        // as: "category",
        attributes: ["title"],
      },
      {
        model: ExampleDemand,
        attributes: ["uuid", "title"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).send(videos);
};

exports.bookmarkDemand = async (req, res) => {
  const bookmark = ExampleBookmark.findOrCreate({
    where: {
      userId: req.user.id,
    },
    defaults: {
      demandId: req.demand.id,
    },
  });

  if (!bookmark) throw new CustomError("Could not add bookmark", 400);

  res.status(200).send(Z);
};

exports.removeDemandBookmark = async (req, res) => {
  const bookmark = ExampleBookmark.destroy({
    where: {
      userId: req.user.id,
      demandId: req.demand.id,
    },
  });

  if (!bookmark) throw new CustomError("Could not add bookmark", 400);

  res.status(200).send(Z);
};
