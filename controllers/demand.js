const ExampleDemand = require("../models").ExampleDemand;
const { nanoid } = require("nanoid");
const { CustomError } = require("../utils");

exports.addDemand = async (req, res) => {
  let deamndId = nanoid();

  const demand = await ExampleDemand.findOrCreate({
    where: {
      uuid: deamndId,
    },
    defaults: {
      uuid: deamndId,
      title: req.body.title,
      description: req.body.description,
      categoryId: req.body.categoryId,
      userId: req.user.id,
    },
  });

  if (!demand) throw new CustomError();

  return res.status(200).send(demand[0]);
};
