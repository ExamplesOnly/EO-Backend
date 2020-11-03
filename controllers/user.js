const Users = require("../models").User;
const Video = require("../models").Video;
const UserCategory = require("../models").UserCategory;

exports.me = async (req, res) => {
  const user = await Users.findOne({
    attributes: [
      "uuid",
      "email",
      "firstName",
      "middleName",
      "lastName",
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

exports.getVideos = async (req, res) => {
  const user = await Users.findOne({
    where: { email: req.user.email },
  });

  if (!user) throw new CustomError("Account not found");

  const video = await Video.findAll({
    where: { userId: user.id },
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

  res.status(200).send(video);
};
