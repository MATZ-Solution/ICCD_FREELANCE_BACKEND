// emailService.js
const nodemailer = require('nodemailer');

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
    //   host: "matzsolutions.com",
      port: 465,
      secure: true,
      auth: {
        user: "sohaibnayyar.721@gmail.com", // Your Gmail address
        pass: "xicf ohgl flvd jkpo", // Your generated app password
      },
      debug: true, // Enable debug output
    });

    const mailOptions = {
      from: "sohaibnayyar.721@gmail.com",
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    // throw new Error('Error sending email');
  }
};

module.exports = { sendEmail };