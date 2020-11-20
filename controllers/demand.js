const ExampleDemand = require("../models").ExampleDemand;
const User = require("../models").User;
const Category = require("../models").Category;
const Video = require("../models").Video;
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

  if (!demand) throw new CustomError();

  return res.status(200).send(demand[0]);
};

exports.getDemands = async (req, res) => {
  const demands = await ExampleDemand.findAll({
    attributes: ["uuid", "title", "description"],
    include: [
      {
        model: User,
        // as: "user",
        attributes: [
          "email",
          "firstName",
          "lastName",
          "profileImage",
          "verified",
        ],
      },
      {
        model: Category,
        // as: "category",
        attributes: ["title"],
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
        attributes: [
          "email",
          "firstName",
          "lastName",
          "profileImage",
          "verified",
        ],
      },
      {
        model: Category,
        // as: "category",
        attributes: ["title"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).send(videos);
};

exports.bookmarkDemand = async (req, res) => {};
