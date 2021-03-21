const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const Videos = require("../models").Video;
const Users = require("../models").User;
const ExampleDemand = require("../models").ExampleDemand;
const VideoCategory = require("../models").VideoCategory;
const VideoBow = require("../models").VideoBow;
const VideoView = require("../models").VideoView;
const VideoReach = require("../models").VideoReach;
const VideoPlayTime = require("../models").VideoPlayTime;
const VideoBookmark = require("../models").VideoBookmark;
const VideoReport = require("../models").VideoReport;
const { sequelize } = require("../models");
const { nanoid } = require("nanoid");
const { CustomError } = require("../utils");
const { deleteVideoS3 } = require("../config/media");

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

exports.uploadVideo = multer({
  storage: multerS3({
    s3: s3,
    bucket:
      process.env.NODE_ENV == "production"
        ? process.env.AWS_S3_PRIVATE_BUCKET_NAME
        : process.env.AWS_S3_DEV_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(
        null,
        file.fieldname == "thumbnail"
          ? `${req.videoId}_thumb`
          : `${req.videoId}.mp4`
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
    fileKey: req.files["file"][0].key,
    thumbKey: req.files["thumbnail"][0].key,
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
    } catch (e) {
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
  let video = await Videos.findAll({
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
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM VideoBookmarks WHERE videoId=Video.id AND userId=${req.user.id})`
        ),
        "userBookmarked",
      ],
      "url",
      "thumbUrl",
      "fileKey",
      "thumbKey",
      "createdAt",
    ],
    include: [
      {
        model: Users,
        attributes: [
          "uuid",
          "email",
          "firstName",
          "profileImage",
          "profileImageKey",
        ],
      },
      {
        model: ExampleDemand,
        attributes: ["uuid", "title"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  // parse video data to an json object
  video = JSON.parse(JSON.stringify(video));

  // remove unnecessary ExampleDemand data
  video.map(function (vid) {
    if (!vid.ExampleDemand || !vid.ExampleDemand.uuid) {
      vid.ExampleDemand = null;
    } else {
      vid.title = vid.ExampleDemand.title;
    }

    delete vid.fileKey;
    delete vid.thumbKey;
    return vid;
  });

  return res.status(200).send(video);
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
  let videoData = JSON.parse(JSON.stringify(video));

  await deleteVideoS3(videoData.videoId + ".mp4");
  await deleteVideoS3(videoData.videoId + "_thumb");
  return res.status(200).send({});
};

exports.getVideo = async (req, res) => {
  if (!req.params.uuid) throw new CustomError("Not Found", 404);

  let video = await Videos.findOne({
    where: {
      videoId: req.params.uuid,
    },
    attributes: [
      "videoId",
      "size",
      "duration",
      "height",
      "width",
      "title",
      "description",
      [sequelize.literal("COUNT(DISTINCT(VideoBows.userId))"), "bow"],
      [sequelize.literal("COUNT(DISTINCT(VideoViews.uuid))"), "view"],
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Video.id AND userId=${req.user.id})`
        ),
        "userBowed",
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM VideoBookmarks WHERE videoId=Video.id AND userId=${req.user.id})`
        ),
        "userBookmarked",
      ],
      "url",
      "thumbUrl",
      "fileKey",
      "thumbKey",
      "createdAt",
    ],
    include: [
      {
        model: Users,
        attributes: [
          "uuid",
          "email",
          "firstName",
          "profileImage",
          "profileImageKey",
        ],
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
  });

  if (!video) {
    throw new CustomError("Video not found", 400);
  }

  // parse video data to an json object
  video = JSON.parse(JSON.stringify(video));

  // remove unnecessary ExampleDemand data
  if (!video.ExampleDemand || !video.ExampleDemand.uuid) {
    video.ExampleDemand = null;
  } else {
    video.title = video.ExampleDemand.title;
  }

  // remove unnecessery data from video object
  delete video.id;
  delete video.fileKey;
  delete video.thumbKey;

  return res.status(200).send(video);
};

exports.postReach = async (req, res) => {
  const reach = await VideoReach.create({
    videoId: req.video.id,
    userId: req.user.id,
  });

  return res.status(200).send(reach);
};

exports.postView = async (req, res) => {
  let viewData = {
    videoId: req.video.id,
    userId: req.user.id,
  };

  if (req.body.reachId) {
    viewData.reachId = req.body.reachId;
  }

  let view = await VideoView.create(viewData);
  return res.status(200).send({
    uuid: view.uuid,
  });
};

exports.postPlayTime = async (req, res) => {
  let playData = {
    videoId: req.video.id,
    userId: req.user.id,
    playTime: req.body.playTime,
  };

  let play = await VideoPlayTime.findOrCreate({
    where: { viewId: req.body.viewId },
    defaults: playData,
  });

  // update entry if it already exists
  // but only if the play time is greater
  // than previous value
  if (
    !play[1] &&
    JSON.parse(JSON.stringify(play))[0].playTime < parseInt(req.body.playTime)
  ) {
    VideoPlayTime.update(
      { playTime: req.body.playTime },
      {
        where: {
          viewId: req.body.viewId,
        },
      }
    );
  }

  return res.status(200).send({
    uuid: play.uuid,
    viewId: play.viewId,
  });
};

exports.postBow = async (req, res, next) => {
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

  // Pass notification data to notification middleware
  req.notificationData = { bow: bow[0].dataValues, isAdded: bow[1] };

  // return notiication data
  res.status(200).send({ status: bow[1] });

  return next();
};

exports.bookmarkVideo = async (req, res) => {
  var bookmark = await VideoBookmark.findOrCreate({
    where: {
      videoId: req.video.id,
      userId: req.user.id,
    },
  });

  // delete if already bow'ed
  if (!bookmark[1]) {
    await VideoBookmark.destroy({
      where: {
        videoId: req.video.id,
        userId: req.user.id,
      },
    });
  }

  return res.status(200).send({ status: bookmark[1] });
};

exports.reportVideo = async (req, res) => {
  var report = await VideoReport.findOrCreate({
    where: {
      videoId: req.video.id,
      userId: req.user.id,
      reportId: 2,
    },
  });

  if (!report) {
    throw new CustomError("Could not report", 400);
  }

  return res.status(200).send({ status: true });
};
