const AWS = require("aws-sdk");

exports.s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  params: {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
  },
});
