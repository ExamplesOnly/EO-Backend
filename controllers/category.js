const User = require("../models").User;
const Category = require("../models").Category;

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
