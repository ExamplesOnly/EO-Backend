const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const { generateDynamicLink } = require("../utils");
const { addHours } = require("date-fns");

const Users = require("../models").User;

const verifyEmailTemplatePath = path.join(
  __dirname,
  "..",
  "static",
  "verify_account.html"
);

const verifyEmailTemplate = fs.readFileSync(verifyEmailTemplatePath, {
  encoding: "utf-8",
});

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
      emailVerified: false,
      verification_token: token,
      verification_expires: addHours(new Date(), 48).toISOString(),
    },
    {
      where: {
        email,
      },
    }
  );

  const dynamicLink = await generateDynamicLink(
    `${process.env.MAIL_VERIFY_URL}${token}`
  );

  const confirmLink = await dynamicLink.json();

  const mail = await transporter.sendMail({
    from: process.env.MAIL_FROM_NO_REPLY || process.env.MAIL_USER,
    to: email,
    subject: "Verify your account",
    text: `Thank you for choosing ExamplesOnly. Please verify your e-mail to finish signing up for ExamplesOnly.

    Please visit the link below to verify your email address.
    
    ${confirmLink.shortLink}`,
    html: verifyEmailTemplate
      .replace(/{{email}}/gm, email)
      .replace(/{{verification_url}}/gm, confirmLink.shortLink),
  });

  if (!mail.accepted.length) {
    throw new CustomError("Couldn't send verification email. Try again later.");
  }
};
