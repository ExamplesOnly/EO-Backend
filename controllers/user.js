const Users = require("../models").Users;

exports.me = async (req, res) => {
  const user = await Users.findOne({
    where: { email: req.body.email ? req.body.email : "" },
  });

  if (user)
    return res.status(200).send({
      status: "success",
      user: user,
    });

  return res.status(401).send({
    status: "fail",
  });
};
