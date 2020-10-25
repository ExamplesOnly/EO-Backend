const Users = require("../models").Users;

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
    where: { email: req.body.email },
  });

  if (user)
    return res.status(200).send({
      status: "success",
      user: user,
    });

  throw new CustomError("Account not found");
};
