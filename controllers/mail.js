const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const { generateDynamicLink } = require("../utils");
const { addHours } = require("date-fns");

var AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
var SES = new AWS.SES({ apiVersion: "2010-12-01" });

const Users = require("../models").User;

const verifyEmailTemplatePath = path.join(
  __dirname,
  "..",
  "static",
  "verify_account.html"
);

const resetPassEmailTemplatePath = path.join(
  __dirname,
  "..",
  "static",
  "reset_password.html"
);

const verifyEmailTemplate = fs.readFileSync(verifyEmailTemplatePath, {
  encoding: "utf-8",
});
const resetPassEmailTemplate = fs.readFileSync(resetPassEmailTemplatePath, {
  encoding: "utf-8",
});

const MAIL_VERIFICATION_EXPIRY = process.env.MAIL_VERIFICATION_EXPIRY_HR
  ? process.env.MAIL_VERIFICATION_EXPIRY_HR
  : 48;
const MAIL_RESET_PASSWORD_EXPIRY = process.env.MAIL_RESET_PASSWORD_EXPIRY_HR
  ? process.env.MAIL_RESET_PASSWORD_EXPIRY_HR
  : 2;

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

exports.awsverification = async (email) => {
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
  // generate verification link
  const dynamicLink = await generateDynamicLink(
    `${process.env.MAIL_VERIFY_URL}${token}`
  );

  const confirmLink = await dynamicLink.json();

  // Mail sending parameters
  var params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: verifyEmailTemplate
            .replace(/{{email}}/gm, email)
            .replace(/{{verification_url}}/gm, confirmLink.shortLink)
            .replace(/{{time_limit}}/gm, MAIL_VERIFICATION_EXPIRY),
        },
        Text: {
          Charset: "UTF-8",
          Data: `Thank you for choosing ExamplesOnly. Please verify your e-mail to finish signing up for ExamplesOnly.

    Please visit the link below to verify your email address.
    
    ${confirmLink.shortLink}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Verify your account - ExamplesOnly",
      },
    },
    Source: `${process.env.MAIL_FROM_NO_REPLY || process.env.MAIL_USER}`,
    ReplyToAddresses: [
      `${process.env.MAIL_FROM_NO_REPLY || process.env.MAIL_USER}`,
    ],
  };

  let mailSent = await SES.sendEmail(params, (err, data) => {}).promise();

  console.log(mailSent);
};

exports.sendResetPasswordMail = async (user, token) => {
  // generate verification link
  const dynamicLink = await generateDynamicLink(
    `${process.env.MAIL_RESET_PASS_URL}${token}`
  );
  const confirmLink = await dynamicLink.json();

  // Mail sending parameters
  var params = {
    Destination: {
      ToAddresses: [user.email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: resetPassEmailTemplate
            .replace(/{{name}}/gm, user.firstName)
            .replace(/{{email}}/gm, user.email)
            .replace(/{{verification_url}}/gm, confirmLink.shortLink)
            .replace(/{{time_limit}}/gm, MAIL_RESET_PASSWORD_EXPIRY),
        },
        Text: {
          Charset: "UTF-8",
          Data: `We've received a request to reset your password, if you didn't make the request, just ignore this mail. 
          
          Otherwise, please visit the link below to reset your password.
    
          ${confirmLink.shortLink}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Reset Password - ExamplesOnly",
      },
    },
    Source: `${process.env.MAIL_FROM_NO_REPLY || process.env.MAIL_USER}`,
    ReplyToAddresses: [
      `${process.env.MAIL_FROM_NO_REPLY || process.env.MAIL_USER}`,
    ],
  };

  SES.sendEmail(params, (err, data) => {});
};
