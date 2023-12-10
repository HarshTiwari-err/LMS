const nodemailer = require("nodemailer");

const mailSender = async function (email, title, body) {
  try {
    let transpoter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        auth: process.env.MAIL_PASS,
      },
    });
    let info = transpoter.sendMail({
      from: "Edtech Platform",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log(info);
    return info;
  } catch (error) {
    console.log("Error occured in nodemailer",error);
    throw error
  }
};

module.exports = mailSender;
