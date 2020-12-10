const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const Videos = require("../models").Video;
const Users = require("../models").User;
const ExampleDemand = require("../models").ExampleDemand;
const VideoCategory = require("../models").VideoCategory;
const VideoBow = require("../models").VideoBow;
const VideoView = require("../models").VideoView;
const { sequelize } = require("../models");
const { nanoid } = require("nanoid");
const { CustomError } = require("../utils");
const { deleteFileS3 } = require("../config/media");

const { s3 } = require("../config/media");

exports.setupVideo = async (req, res, next) => {
  req.videoId = nanoid();
  next();
  // });
};

exports.verifyUpload = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    throw new CustomError(message, 400);
  }
  return next();
};

exports.uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    acl: process.env.AWS_S3_ACL,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(
        null,
        file.fieldname == "thumbnail"
          ? `${req.videoId}_thumb` //_temp`
          : `${req.videoId}` //_temp`
      );
    },
  }),
});

exports.saveVideo = async (req, res) => {
  let catt = [];
  let categoryList, categoriesCount, demand;

  let defaults = {
    videoId: req.videoId,
    title: req.body.title,
    description: req.body.description,
    duration: req.body.duration,
    height: req.body.height,
    width: req.body.width,
    size: req.files["file"][0].size,
    url: req.files["file"][0].location,
    thumbUrl: req.files["thumbnail"][0].location,
    userId: req.user.id,
  };

  if (req.body.demandId) {
    demand = await ExampleDemand.findOne({
      where: { uuid: req.body.demandId },
      raw: true,
    });

    if (!demand) {
      throw new CustomError("Demand not found", 400);
    }

    defaults.demandId = demand.id;
  }

  const user = await Users.findOne({
    where: { email: req.user.email },
  });

  const video = await Videos.findOrCreate({
    where: {
      videoId: req.videoId,
    },
    defaults,
  });

  if (req.body.categories) {
    try {
      categoryList = JSON.parse(req.body.categories);
      categoriesCount = categoryList.categories.length;
      req.categories = categoryList.categories;
      req.categoriesCount = categoriesCount;

      for (let i = 0; i < req.categoriesCount; i++) {
        catt.push({
          videoId: video[0].dataValues.id,
          categoryId: req.categories[i],
        });
      }

      console.log("CHECK", categoryList, categoriesCount);
    } catch (e) {
      console.log(e);
      throw new CustomError("Wrong request format.", 400);
    }

    try {
      const categories = await VideoCategory.bulkCreate(catt, {
        returning: true,
        ignoreDuplicates: true,
      });
    } catch (error) {
      throw new CustomError("Failed to add categories.", 400);
    }
  }

  return res.status(200).send(video[0]);
};

exports.getVideos = async (req, res) => {
  const video = await Videos.findAll({
    attributes: [
      "videoId",
      "size",
      "duration",
      "height",
      "width",
      "title",
      "description",
      [sequelize.literal("COUNT(DISTINCT(VideoBows.userId))"), "bow"],
      [sequelize.literal("COUNT(DISTINCT(VideoViews.id))"), "view"],
      "url",
      "thumbUrl",
      "createdAt",
    ],
    include: [
      {
        model: Users,
        // as: "user",
        attributes: ["uuid", "email", "firstName", "profileImage"],
      },
      {
        model: ExampleDemand,
        attributes: ["uuid", "title"],
      },
      {
        model: VideoBow,
        attributes: [],
      },
      {
        model: VideoView,
        attributes: [],
      },
    ],
    order: [["createdAt", "DESC"]],
    raw: true,
    nest: true,
  });

  res.send(video);
};

exports.deleteVideo = async (req, res) => {
  const video = await Videos.findOne({
    where: {
      videoId: req.body.videoId,
      userId: req.user.id,
    },
  });

  if (!video) {
    throw new CustomError("Video not found", 400);
  }

  video.destroy();
  await deleteFileS3(video.videoId);
  return res.status(200).send({});
};

exports.getVideo = async (req, res) => {
  if (!req.params.uuid) throw new CustomError("Not Found", 404);

  const video = await Videos.findOne({
    where: {
      videoId: req.params.uuid,
    },
    attributes: [
      "id",
      "videoId",
      "size",
      "duration",
      "height",
      "width",
      "title",
      "description",
      [sequelize.literal("COUNT(DISTINCT(VideoBows.userId))"), "bow"],
      [sequelize.literal("COUNT(DISTINCT(VideoViews.id))"), "view"],
      // [sequelize.fn("COUNT", sequelize.col("VideoViews.videoId")), "view"],
      "url",
      "thumbUrl",
      "createdAt",
    ],
    include: [
      {
        model: Users,
        attributes: ["uuid", "email", "firstName", "profileImage"],
      },
      {
        model: ExampleDemand,
        attributes: ["uuid", "title"],
      },
      {
        model: VideoBow,
        attributes: [],
      },
      {
        model: VideoView,
        attributes: [],
      },
    ],
    raw: true,
    nest: true,
  });

  if (!video) {
    throw new CustomError("Video not found", 400);
  }

  // check if current user bow'ed the video
  const videoBow = await VideoBow.findOne({
    where: {
      userId: req.user.id,
      videoId: video.id,
    },
    raw: true,
  });

  if (videoBow) {
    video.isBowed = true;
  } else {
    video.isBowed = false;
  }

  // remove video id from video data object
  delete video.id;

  return res.status(200).send(video);
};

exports.postView = async (req, res) => {
  const bow = await VideoBow.create({
    where: {
      videoId: req.video.id,
      userId: req.user.id,
    },
  });

  return res.status(200).send({});
};

exports.postBow = async (req, res) => {
  const bow = await VideoBow.findOrCreate({
    where: {
      videoId: req.video.id,
      userId: req.user.id,
    },
  });

  // delete if already bow'ed
  if (!bow[1]) {
    await VideoBow.destroy({
      where: {
        videoId: req.video.id,
        userId: req.user.id,
      },
    });
  }

  return res.status(200).send({ status: bow[1] });
};
