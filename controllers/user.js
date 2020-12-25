const User = require("../models").User;
const Video = require("../models").Video;
const UserCategory = require("../models").UserCategory;
const Category = require("../models").Category;
const ExampleBookmark = require("../models").ExampleBookmark;
const ExampleDemand = require("../models").ExampleDemand;
const { sequelize } = require("../models");
const { CustomError } = require("../utils");
const { s3 } = require("../config/media");

const cdnHost = process.env.AWS_CLOUFRONT_PUBLIC_HOST
  ? process.env.AWS_CLOUFRONT_PUBLIC_HOST
  : "cdn.examplesonly.com";

exports.me = async (req, res) => {
  let user = await User.findOne({
    attributes: [
      "uuid",
      "email",
      "firstName",
      "middleName",
      "lastName",
      "gender",
      "dob",
      "bio",
      "phoneNumber",
      "countryCode",
      "profileImage",
      "coverImage",
      "profileImageKey",
      "coverImageKey",
      "emailVerified",
      "blocked",
    ],
    where: { email: req.user.email },
  });

  if (user) return res.status(200).send(user);

  throw new CustomError("Account not found");
};

exports.addInterests = async (req, res) => {
  let interesets = [];

  try {
    categoryList = JSON.parse(req.body.categories);
    categoriesCount = categoryList.categories.length;
    req.categories = categoryList.categories;
    req.categoriesCount = categoriesCount;

    for (let i = 0; i < req.categoriesCount; i++) {
      interesets.push({
        userId: req.user.id,
        categoryId: req.categories[i],
      });
    }
    try {
      const removeCategories = await UserCategory.destroy({
        where: {
          userId: req.user.id,
        },
      });

      const categories = await UserCategory.bulkCreate(interesets, {
        returning: true,
        ignoreDuplicates: true,
      });
    } catch (error) {
      throw new CustomError("Failed to add interests.", 400);
    }
  } catch (error) {
    console.log(error);
    throw new CustomError("Failed to add interests.", 400);
  }

  return res.status(200).send({});
};

exports.uploadProfileImage = async (req, res) => {
  if (!req.file) throw new CustomError("Profile image upload failed", 400);

  const userData = await User.findOne({
    where: { email: req.user.email },
  });

  if (userData && userData.profileImageKey) {
    await deleteFileS3(userData.profileImageKey);
  }

  const user = await User.update(
    {
      profileImageKey: req.file.key,
    },
    {
      where: { email: req.user.email },
    }
  );

  if (!user) throw new CustomError("Some error occured", 400);

  console.log(user, req.file);

  res.status(200).send({
    url: req.file.key ? `https://${cdnHost}/${req.file.key}` : null,
  });
};

exports.uploadCoverImage = async (req, res) => {
  if (!req.file) throw new CustomError("Cover image upload failed", 400);

  const userData = await User.findOne({
    where: { email: req.user.email },
  });

  if (userData && userData.coverImageKey) {
    await deleteFileS3(userData.coverImageKey);
  }

  const user = await User.update(
    {
      coverImageKey: req.file.key,
    },
    {
      where: { email: req.user.email },
    }
  );

  if (!user) throw new CustomError("Some error occured", 400);

  res
    .status(200)
    .send({ url: req.file.key ? `https://${cdnHost}/${req.file.key}` : null });
};

exports.updateProfile = async (req, res) => {
  const user = await User.update(
    {
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      bio: req.body.bio,
    },
    {
      where: { email: req.user.email },
    }
  );

  if (!user) throw new CustomError("Some error occured", 400);

  res.status(200).send({});
};

exports.getVideos = async (req, res) => {
  const user = await User.findOne({
    where: { email: req.user.email },
  });

  if (!user) throw new CustomError("Account not found");

  const video = await Video.findAll({
    where: { userId: user.id },
    attributes: videoListAttributes,
    order: [["createdAt", "DESC"]],
  });

  res.status(200).send(video);
};

exports.getUserDemands = async (req, res) => {
  const demands = await ExampleDemand.findAll({
    where: {
      userId: req.user.id,
    },
    attributes: [
      "uuid",
      "title",
      "description",
      [sequelize.fn("COUNT", sequelize.col("Videos.id")), "videoCount"],
      // [sequelize.fn("COUNT", sequelize.findAll({})), "isBookmarked"],
    ],
    group: ["uuid"],
    include: [
      {
        model: User,
        attributes: [
          "email",
          "firstName",
          "lastName",
          "profileImage",
          "profileImageKey",
          "emailVerified",
        ],
      },
      {
        model: Category,
        attributes: ["title"],
      },
      {
        model: Video,
        attributes: [
          "videoId",
          "size",
          "duration",
          "height",
          "width",
          "title",
          "description",
          "url",
          "thumbUrl",
          "createdAt",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).send(demands);
};

exports.getDemandsBookmarks = async (req, res) => {
  const bookmars = await User.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: ExampleDemand,
        attributes: [
          "uuid",
          "title",
          "description",
          [sequelize.fn("COUNT", sequelize.col("Videos.id")), "VideoCount"],
        ],
      },
      {
        model: Video,
        attributes: [
          "videoId",
          "size",
          "duration",
          "height",
          "width",
          "title",
          "description",
          "url",
          "thumbUrl",
          "createdAt",
        ],
      },
    ],
  });

  res.status(200).send(bookmars.ExampleDemands);
};

exports.getInterest = async (req, res) => {
  const bookmarks = await User.findOne({
    where: { id: req.user.id },
    include: [
      {
        model: Category,
        attributes: ["id", "title", "thumbUrl", "slug"],
      },
    ],
  });

  res.send(bookmarks.Categories);
};

exports.getUserProfile = async (req, res) => {
  if (!req.params.uuid) throw new CustomError("User uuid is required", 400);

  const user = await User.findOne({
    where: { uuid: req.params.uuid },
    attributes: [
      "id",
      "uuid",
      "email",
      "firstName",
      "gender",
      "dob",
      "bio",
      "phoneNumber",
      "countryCode",
      "profileImage",
      "coverImage",
      "profileImageKey",
      "coverImageKey",
      "emailVerified",
      "blocked",
    ],
    include: [
      {
        model: Category,
        attributes: ["id", "title", "thumbUrl", "slug"],
      },
    ],
  });

  if (!user) throw new CustomError("User account not found", 400);

  const userData = JSON.parse(JSON.stringify(user));
  if (userData.emailVerified == 0) {
    userData.emailVerified = false;
  } else if (userData.emailVerified == 1) {
    userData.emailVerified = true;
  }

  let userVideos = await Video.findAll({
    where: {
      userId: userData.id,
    },
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
      "url",
      "thumbUrl",
      "fileKey",
      "thumbKey",
      "createdAt",
    ],
    include: [
      {
        model: ExampleDemand,
        attributes: ["uuid", "title"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 12,
    subQuery: false,
  });

  // parse video data to an json object
  userVideos = JSON.parse(JSON.stringify(userVideos));

  // remove unnecessary ExampleDemand data
  userVideos.map(function (vid) {
    if (!vid.ExampleDemand || !vid.ExampleDemand.uuid) {
      vid.ExampleDemand = null;
    } else {
      vid.title = vid.ExampleDemand.title;
    }

    delete vid.fileKey;
    delete vid.thumbKey;
    return vid;
  });

  userData.Videos = userVideos;
  delete userData.id;

  res.status(200).send(userData);
};

async function deleteFileS3(file) {
  return s3
    .deleteObject({
      Key: file,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    })
    .promise();
}
