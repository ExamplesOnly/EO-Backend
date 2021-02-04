const User = require("../models").User;
const Video = require("../models").Video;
const UserCategory = require("../models").UserCategory;
const Category = require("../models").Category;
const ExampleBookmark = require("../models").ExampleBookmark;
const ExampleDemand = require("../models").ExampleDemand;
const UserFollow = require("../models").UserFollow;
const { sequelize } = require("../models");
const { CustomError } = require("../utils");
const { s3 } = require("../config/media");
const { signUrl } = require("../config/media");

const thirtyMins = 30 * 60 * 1000;

const cdnHost = process.env.AWS_CLOUFRONT_PUBLIC_HOST
  ? process.env.AWS_CLOUFRONT_PUBLIC_HOST
  : "cdn.examplesonly.com";

const mediaCdnHost = process.env.AWS_CLOUFRONT_MEDIA_HOST
  ? process.env.AWS_CLOUFRONT_MEDIA_HOST
  : "mediacdn.examplesonly.com";

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
      "createdAt",
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

  let userData = await User.findOne({
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
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM UserFollows WHERE (followerUuid = "${req.user.uuid}" AND followingUuid = "${req.params.uuid}"))`
        ),
        "isFollowing",
      ],
      [
        sequelize.literal(
          `(SELECT COUNT(*) FROM UserFollows WHERE (followerUuid = "${req.params.uuid}" AND followingUuid = "${req.user.uuid}"))`
        ),
        "isFollowedBy",
      ],
    ],
    include: [
      {
        model: Category,
        attributes: ["id", "title", "thumbUrl", "slug"],
      },
    ],
  });

  if (!userData) throw new CustomError("User account not found", 404);

  // const userData = JSON.parse(JSON.stringify(user));

  // get json data from sequelize object
  userData = userData.get({ plain: true });

  // generalize user data
  userData = Object.assign({}, userData, {
    emailVerified: userData.emailVerified == 1,
    isFollowing: userData.isFollowing == 1,
    isFollowedBy: userData.isFollowedBy == 1,
  });

  // get user videos
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
  // userVideos = userVideos.get({ plain: true });

  // remove unnecessary ExampleDemand data
  userVideos = userVideos.map(function (vid) {
    vid = vid.get({ plain: true });

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

exports.getVideoBookmarks = async (req, res) => {
  const [results, metadata] = await sequelize.query(
    `SELECT Videos.videoId, Videos.size, Videos.duration, Videos.height, Videos.width, Videos.title, Videos.description, ` +
      `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Videos.id) AS bow, ` +
      `(SELECT COUNT(*) FROM VideoViews WHERE videoId=Videos.id) AS view, ` +
      `(SELECT COUNT(*) FROM VideoBows WHERE videoId=Videos.id AND userId=${req.user.id})  AS userBowed, ` +
      `(SELECT COUNT(*) FROM VideoBookmarks WHERE videoId=Videos.id AND userId=${req.user.id}) AS userBookmarked, ` +
      `Videos.fileKey, Videos.thumbKey, Videos.createdAt FROM Users ` +
      `INNER JOIN VideoBookmarks on Users.id = VideoBookmarks.userId ` +
      `INNER JOIN Videos on VideoBookmarks.videoId = Videos.id ` +
      `WHERE Users.id = ${req.user.id}`
  );

  results.map((vid) => {
    vid.url = signUrl(mediaCdnHost, vid["fileKey"], thirtyMins);
    vid.thumbUrl = signUrl(mediaCdnHost, vid["thumbKey"], thirtyMins);

    delete vid["fileKey"];
    delete vid["thumbKey"];
    return vid;
  });

  res.status(200).send(results);
};

exports.followUser = async (req, res) => {
  var follow = await UserFollow.findOrCreate({
    where: {
      followerUuid: req.user.uuid,
      followingUuid: req.followUser.uuid,
    },
  });

  return res.status(200).send({ status: true, data: true });
};

exports.unfollowUser = async (req, res) => {
  var follow = await UserFollow.findOne({
    where: {
      followerUuid: req.user.uuid,
      followingUuid: req.followUser.uuid,
    },
  });

  // unfollow if already following
  if (follow) {
    await follow.destroy();
  }

  return res.status(200).send({ status: true, data: true });
};

exports.getFollowings = async (req, res) => {
  if (!req.params.uuid) throw new CustomError("Invalid Request", 400);

  let userData = await UserFollow.findAll({
    where: {
      followerUuid: req.params.uuid,
    },
    limit: req.limit,
    offset: req.offset,
    include: {
      model: User,
      as: "following",
      attributes: [
        "uuid",
        "email",
        "firstName",
        "profileImage",
        "profileImageKey",
        "blocked",
      ],
    },
  });

  if (!userData) throw new CustomError("Invalid Request", 400);

  // user doesn't have any followers
  if (userData.length == 0) {
    return res.send([]);
  }

  // get json data from sequelize object
  userData = userData.map((u) => {
    return u.get({ plain: true });
  });

  // generalize user follower data
  userData = userData.map((u) => {
    delete u.following.profileImageKey;
    return u.following;
  });

  return res.send(userData);
};

exports.getFollowers = async (req, res) => {
  if (!req.params.uuid) throw new CustomError("Invalid Request", 400);

  // get who is following this user
  let userData = await UserFollow.findAll({
    where: {
      followingUuid: req.params.uuid,
    },
    limit: req.limit,
    offset: req.offset,
    include: {
      model: User,
      as: "follower",
      attributes: [
        "uuid",
        "email",
        "firstName",
        "profileImage",
        "profileImageKey",
        "blocked",
      ],
    },
  });

  if (!userData) throw new CustomError("Invalid Request", 400);

  // user doesn't have any followers
  if (userData.length == 0) {
    return res.send([]);
  }

  // get json data from sequelize object
  userData = userData.map((u) => {
    return u.get({ plain: true });
  });

  // generalize user follower data
  userData = userData.map((u) => {
    delete u.follower.profileImageKey;
    return u.follower;
  });

  return res.send(userData);
};

async function deleteFileS3(file) {
  return s3
    .deleteObject({
      Key: file,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    })
    .promise();
}
