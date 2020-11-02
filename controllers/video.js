const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
var multiparty = require("multiparty");
const Videos = require("../models").Video;
const Users = require("../models").User;
const nanoid = require("nanoid");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  params: {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
  },
});

exports.setupVideo = async (req, res, next) => {
  var form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    req.body.title = fields.title ? fields.title[0] : undefined;
    req.body.description = fields.description
      ? fields.description[0]
      : undefined;
  });
  req.fileName = Date.now().toString();
  next();
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
        file.fieldname == "thumbnail" ? `${req.fileName}_thumb` : req.fileName
      );
    },
  }),
});

exports.saveVideo = async (req, res) => {
  const videoId = nanoid();
  const user = await Users.findOne({
    where: { email: req.user.email },
  });

  const video = await Videos.findOrCreate({
    where: {
      videoId: videoId,
    },
    defaults: {
      videoId: videoId,
      title: req.body.title,
      description: req.body.description,
      size: req.files["file"].size,
      url: req.files["file"].location,
      thumbUrl: req.files["thumbnail"].location,
      userId: user.id,
    },
  });
  res.status(200).send(video[0]);
};

exports.getVideos = async (req, res) => {
  const video = await Videos.findAll({
    attributes: [
      "videoId",
      "size",
      "length",
      "title",
      "description",
      "url",
      "thumbUrl",
      "createdAt",
    ],
    include: {
      model: Users,
      // as: "user",
      attributes: [
        "email",
        "firstName",
        "lastName",
        "profileImage",
        "verified",
      ],
    },
    order: [["createdAt", "DESC"]],
  });

  res.send(video);
};
