const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
var multiparty = require("multiparty");
const Videos = require("../models").Videos;
const Users = require("../models").Users;
const customAlphabet = require("nanoid").customAlphabet;
const nanoid = customAlphabet(
  "1234567890abcdefghijklmnopqrstwxyz",
  process.env.ACCOUNT_UUID_LENGTH ? process.env.ACCOUNT_UUID_LENGTH : 10
);

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
      cb(null, Date.now().toString());
    },
  }),
});

exports.saveVideo = async (req, res) => {
  const user = await Users.findOne({
    where: { email: req.user.dataValues.email },
  });

  const video = await Videos.findOrCreate({
    where: {
      videoId: nanoid(),
    },
    defaults: {
      videoId: nanoid(),
      title: req.body.title,
      description: req.body.description,
      url: req.file.location,
      size: req.file.size,
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
        "phoneNumber",
        "countryCode",
        "profileImage",
        "coverImage",
        "verified",
      ],
    },
    order: [["createdAt", "DESC"]],
  });

  res.send(video);
};
