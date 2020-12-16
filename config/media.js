const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { nanoid } = require("nanoid");

let s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  params: {
    Bucket:
      process.env.NODE_ENV == "production"
        ? process.env.AWS_S3_PUBLIC_BUCKET_NAME
        : process.env.AWS_S3_DEV_BUCKET_NAME,
  },
});

let storages3 = multerS3({
  s3: s3,
  acl: process.env.AWS_S3_ACL,
  bucket:
    process.env.NODE_ENV == "production"
      ? process.env.AWS_S3_PUBLIC_BUCKET_NAME
      : process.env.AWS_S3_DEV_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    cb(null, nanoid());
  },
});

let uploads3 = multer({
  storage: storages3,
});

async function deleteFileS3(file) {
  return s3
    .deleteObject({
      Key: file,
      Bucket:
        process.env.NODE_ENV == "production"
          ? process.env.AWS_S3_PUBLIC_BUCKET_NAME
          : process.env.AWS_S3_DEV_BUCKET_NAME,
    })
    .promise();
}

const signer = new AWS.CloudFront.Signer(
  process.env.AWS_CLOUFRONT_ACCESS_KEY,
  process.env.AWS_CLOUFRONT_PRIVATE_KEY
);

function signUrl(host, key, expire) {
  return signer.getSignedUrl({
    url: `https://${host}/${key}`,
    expires: Math.floor((Date.now() + expire) / 1000),
  });
}

// exports.uploadS3 = async (req, res) => {};
module.exports = {
  s3,
  storages3,
  uploads3,
  deleteFileS3,
  signUrl,
};
