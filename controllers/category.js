const User = require("../models").User;
const Category = require("../models").Category;
const Video = require("../models").Video;
const VideoCategory = require("../models").VideoCategory;
const db = require("../models");
const { CustomError } = require("../utils");

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
    attributes: ["id", "title", "slug", "thumbUrl"],
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
    `SELECT Videos.* from Videos INNER JOIN VideoCategories ON Videos.id = VideoCategories.videoId WHERE VideoCategories.categoryId = ${category.id}`
  );

  res.status(200).send(results);
};
