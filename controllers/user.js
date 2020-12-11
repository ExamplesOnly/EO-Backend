const User = require("../models").User;
const Video = require("../models").Video;
const UserCategory = require("../models").UserCategory;
const Category = require("../models").Category;
const ExampleBookmark = require("../models").ExampleBookmark;
const ExampleDemand = require("../models").ExampleDemand;
const { sequelize } = require("../models");
const { CustomError } = require("../utils");
const { s3 } = require("../config/media");

exports.me = async (req, res) => {
  const user = await User.findOne({
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
  const userData = await User.findOne({
    where: { email: req.user.email },
  });

  if (userData && userData.profileImage) {
    let fileSplit = userData.profileImage.split("/");
    let fileName = fileSplit[fileSplit.length - 1];
    await deleteFileS3(fileName);
  }

  const user = await User.update(
    {
      profileImage: req.file.location,
    },
    {
      where: { email: req.user.email },
    }
  );

  if (!user) throw new CustomError("Some error occured", 400);

  res.status(200).send({ url: req.file.location });
};

exports.uploadCoverImage = async (req, res) => {
  const userData = await User.findOne({
    where: { email: req.user.email },
  });

  if (userData && userData.coverImage) {
    let fileSplit = userData.coverImage.split("/");
    let fileName = fileSplit[fileSplit.length - 1];
    await deleteFileS3(fileName);
  }

  const user = await User.update(
    {
      coverImage: req.file.location,
    },
    {
      where: { email: req.user.email },
    }
  );

  if (!user) throw new CustomError("Some error occured", 400);

  res.status(200).send({ url: req.file.location });
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
      "emailVerified",
      "blocked",
    ],
    include: [
      {
        model: Category,
        attributes: ["id", "title", "thumbUrl", "slug"],
      },
    ],
    raw: true,
    nest: true,
  });

  if (!user) throw new CustomError("User account not found", 400);

  const userVideos = await Video.findAll({
    where: {
      userId: user.id,
    },
  });
  user.videos = userVideos;
  delete user.id;

  res.status(200).send(user);
};

async function deleteFileS3(file) {
  return s3
    .deleteObject({
      Key: file,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    })
    .promise();
}
