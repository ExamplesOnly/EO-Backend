const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

let s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  params: {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
  },
});

exports.s3 = s3;

exports.storages3 = multerS3({
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
});

exports.uploadS3 = async (req, res) => {};
