// emailService.js
require("dotenv").config();

const nodemailer = require("nodemailer");

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.email_host_iccd, // NOT the email address
      port: process.env.email_port,
      secure: true,
      auth: {
        user: process.env.email_user, // Email goes here
        pass: process.env.email_pass,
      },
      debug: true, // Enable debug output
    });

    const mailOptions = {
      from: "iccdtalentgate@gmail.com",
      to: recipientEmail,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Error sending email");
  }
};

module.exports = { sendEmail };
