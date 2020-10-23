const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const { generateDynamicLink } = require("../utils");
const { differenceInMinutes, addMinutes, subMinutes } = require("date-fns");

const Users = require("../models").Users;

const mailConfig = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE,
  auth: process.env.MAIL_USER
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      }
    : undefined,
};

const transporter = nodemailer.createTransport(mailConfig);

exports.verification = async (email) => {
  const token = uuidv4();
  const user = await Users.update(
    {
      verified: true,
      verification_token: token,
      verification_expires: addMinutes(new Date(), 15).toISOString(),
    },
    {
      where: {
        email,
      },
    }
  );

  const confirmLink = await generateDynamicLink(
    `http://api.examplesonly.com/v1/auth/verify/${token}`
  );

  const mail = await transporter.sendMail({
    from: process.env.MAIL_FROM_NO_REPLY || process.env.MAIL_USER,
    to: email,
    subject: "Verify your account",
    text: `Verify your ExamplesOnly account by visiting this link: ${confirmLink}`,
    html: `Verify your <b>ExamplesOnly</b> account by visiting this link: ${confirmLink}`,
  });

  if (!mail.accepted.length) {
    throw new CustomError("Couldn't send verification email. Try again later.");
  }
};
