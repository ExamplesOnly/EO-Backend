const User = require("../models").User;
const Category = require("../models").Category;
const Video = require("../models").Video;
const VideoCategory = require("../models").VideoCategory;
const db = require("../models");
const { CustomError } = require("../utils");
const { QueryTypes } = require("sequelize");
const { signUrl } = require("../config/media");

const thirtyMins = 30 * 60 * 1000;
const sevenDays = 7 * 24 * 60 * 60 * 1000;

const mediaCdnHost = process.env.AWS_CLOUFRONT_MEDIA_HOST
  ? process.env.AWS_CLOUFRONT_MEDIA_HOST
  : "mediacdn.examplesonly.com";

const publicCdnHost = process.env.AWS_CLOUFRONT_PUBLIC_HOST
  ? process.env.AWS_CLOUFRONT_PUBLIC_HOST
  : "cdn.examplesonly.com";

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
    order: [["title", "ASC"]],
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
    `SELECT Videos.videoId, Videos.size, Videos.duration, Videos.height, Videos.width, Videos.title, Videos.description, ` +
      `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Videos.id) AS bow, ` +
      `(SELECT COUNT(*) FROM VideoViews WHERE videoId=Videos.id) AS view, ` +
      `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Videos.id AND userId=${req.user.id})  AS userBowed, ` +
      `(SELECT COUNT(*) FROM VideoBookmarks WHERE videoId=Videos.id AND userId=${req.user.id}) AS userBookmarked, ` +
      `Videos.fileKey, Videos.thumbKey, Videos.createdAt, User.uuid AS 'User.uuid', User.firstName AS 'User.firstName', User.email AS 'User.email', User.profileImageKey AS 'User.profileImageKey' from Videos ` +
      `INNER JOIN VideoCategories ON Videos.id = VideoCategories.videoId ` +
      `LEFT OUTER JOIN Users AS User ON Videos.userId = User.id WHERE VideoCategories.categoryId = ${category.id}`
  );

  results.map((vid) => {
    vid.url = signUrl(mediaCdnHost, vid["fileKey"], thirtyMins);
    vid.thumbUrl = signUrl(mediaCdnHost, vid["thumbKey"], thirtyMins);
    vid.User = {};
    vid.User.uuid = vid["User.uuid"];
    vid.User.firstName = vid["User.firstName"];
    vid.User.email = vid["User.email"];

    let profileImageKey = vid["User.profileImageKey"];
    vid.User.profileImage = profileImageKey
      ? `https://${publicCdnHost}/${profileImageKey}`
      : null;

    delete vid["fileKey"];
    delete vid["thumbKey"];
    delete vid["User.uuid"];
    delete vid["User.firstName"];
    delete vid["User.email"];
    delete vid["User.profileImageKey"];
    return vid;
  });

  res.status(200).send(results);
};
