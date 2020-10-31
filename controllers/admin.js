const Users = require("../models").User;

exports.userList = async (req, res) => {
  const users = Users.findAll();
  res.send(users);
};

exports.deleteUser = async (req, res) => {};
