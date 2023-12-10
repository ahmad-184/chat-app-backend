const nodemailer = require("nodemailer");

const AppError = require("../helpers/AppError");

const user = process.env.MAIL_SENDER;
const pass = process.env.MAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = async ({ recipient, subject, html }) => {
  try {
    await transporter.sendMail({
      from: user,
      to: recipient,
      html,
      subject,
    });
  } catch (err) {
    throw new AppError("Email Err:" + err.message, 500);
  }
};
