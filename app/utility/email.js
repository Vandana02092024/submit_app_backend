import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const SendEmail = async (to, subject, message) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_AUTH_USERNAME,
      pass: process.env.EMAIL_AUTH_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return { status: false, error: error };
    } else {
      console.log("Email sent: " + info.response);
      return { status: true, response: info.response };
    }
  });
};
