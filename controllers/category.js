const User = require("../models").User;
const Category = require("../models").Category;
const Video = require("../models").Video;
const VideoCategory = require("../models").VideoCategory;
const db = require("../models");
const { CustomError } = require("../utils");
const { QueryTypes } = require("sequelize");

exports.add = async (req, res) => {
  const category = await Category.findOrCreate({
    where: {
      slug: req.body.slug,
      title: req.body.title,
    },
    defaults: {
      slug: req.body.slug,
      title: req.body.title,
      thumbUrl: req.body.thumbUrl,
    },
  });
  res.status(200).send(category[0]);
};

exports.update = async (req, res) => {
  let updateValues = {};

  req.body.title ? (updateValues.title = req.body.title) : "";
  req.body.thumbUrl ? (updateValues.thumbUrl = req.body.thumbUrl) : "";
  req.body.slug ? (updateValues.slug = req.body.slug) : "";

  const category = Category.update(updateValues, {
    where: { id: req.body.categoryId },
  });

  res.send(200).send(category);
};

exports.getCategories = async (req, res) => {
  const categories = await Category.findAll({
    attributes: [
      "id",
      "title",
      "slug",
      "thumbUrl",
      [
        db.sequelize.literal(
          `(SELECT COUNT(*) FROM VideoCategories WHERE categoryId=Category.id)`
        ),
        "videoCount",
      ],
    ],
  });
  res.status(200).send(categories);
};

exports.getCategoryVideos = async (req, res) => {
  if (!req.params.categorySlug) return next();
  const slug = req.params.categorySlug;

  const category = await Category.findOne({
    where: { slug },
    raw: true,
  });

  if (!category) {
    throw new CustomError("Category not found", 400);
  }

  const [results, metadata] = await db.sequelize.query(
    `SELECT Videos.videoId, Videos.size, Videos.duration, Videos.height, Videos.width, Videos.title, Videos.description, Videos.url, Videos.thumbUrl, Videos.createdAt, User.uuid AS 'User.uuid', User.firstName AS 'User.firstName', User.email AS 'User.email', User.profileImage AS 'User.profileImage' from Videos INNER JOIN VideoCategories ON Videos.id = VideoCategories.videoId LEFT OUTER JOIN Users AS User ON Videos.userId = User.id WHERE VideoCategories.categoryId = ${category.id}`
  );

  results.map((vid) => {
    vid.User = {};
    vid.User.uuid = vid["User.uuid"];
    vid.User.firstName = vid["User.firstName"];
    vid.User.email = vid["User.email"];
    vid.User.profileImage = vid["User.profileImage"];
    delete vid["User.uuid"];
    delete vid["User.firstName"];
    delete vid["User.email"];
    delete vid["User.profileImage"];
    return vid;
  });

  res.status(200).send(results);
};
