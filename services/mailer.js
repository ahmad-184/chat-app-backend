const nodemailer = require("nodemailer");

const AppError = require("../helpers/AppError");

const sender = process.env.MAIL_SENDER;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp-relay.brevo.com",
  port: "587",
  secure: false,
  auth: {
    user: sender,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = async ({ recipient, subject, html }) => {
  try {
    await transporter.sendMail({
      from: sender,
      to: recipient,
      html,
      subject,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};
