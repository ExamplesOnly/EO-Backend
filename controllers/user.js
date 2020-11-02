const Users = require("../models").User;

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
