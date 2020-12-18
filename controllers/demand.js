const { sequelize, Sequelize } = require("../models");
const ExampleDemand = require("../models").ExampleDemand;
const ExampleBookmark = require("../models").ExampleBookmark;
const User = require("../models").User;
const Category = require("../models").Category;
const Video = require("../models").Video;
const Op = Sequelize.Op;
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
    where: {
      userId: {
        [Op.ne]: req.user.id,
      },
    },
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
        attributes: [
          "uuid",
          "email",
          "firstName",
          "profileImage",
          "profileImageKey",
        ],
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
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Videos.id)`
            ),
            "bow",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM VideoViews WHERE videoId=Videos.id)`
            ),
            "view",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Videos.id AND userId=${req.user.id})`
            ),
            "userBowed",
          ],
          "url",
          "thumbUrl",
          "fileKey",
          "thumbKey",
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
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Video.id)`
        ),
        "bow",
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM VideoViews WHERE videoId=Video.id)`
        ),
        "view",
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Video.id AND userId=${req.user.id})`
        ),
        "userBowed",
      ],
      "url",
      "thumbUrl",
      "fileKey",
      "thumbKey",
      "createdAt",
    ],
    include: [
      {
        model: User,
        // as: "user",
        attributes: [
          "uuid",
          "email",
          "firstName",
          "lastName",
          "profileImage",
          "profileImageKey",
        ],
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

  res.status(200).send(bookmark);
};

exports.removeDemandBookmark = async (req, res) => {
  const bookmark = ExampleBookmark.destroy({
    where: {
      userId: req.user.id,
      demandId: req.demand.id,
    },
  });

  if (!bookmark) throw new CustomError("Could not add bookmark", 400);

  res.status(200).send(bookmark);
};
