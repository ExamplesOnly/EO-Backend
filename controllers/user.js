const User = require("../models").User;
const Video = require("../models").Video;
const UserCategory = require("../models").UserCategory;

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
      "verified",
      "blocked",
    ],
    where: { email: req.user.email },
  });

  if (user) return res.status(200).send(user);

  throw new CustomError("Account not found");
};

exports.addInterests = async (req, res) => {
  let interesets = [];

  for (let i = 0; i < req.categoriesCount; i++) {
    interesets.push({
      userId: req.user.id,
      categoryId: req.categories[i],
    });
  }
  try {
    const categories = await UserCategory.bulkCreate(interesets, {
      returning: true,
      ignoreDuplicates: true,
    });
  } catch (error) {
    throw new CustomError("Failed to add interests.", 400);
  }
  return res.status(200).json({ status: "success" });
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

  if (!user) throw new CustomError("User not found", 400);

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
