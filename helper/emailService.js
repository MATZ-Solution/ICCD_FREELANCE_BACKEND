// emailService.js
const nodemailer = require('nodemailer');

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "iccdtalentgate@gmail.com", // Your Gmail address
        pass: "uojg itrw fqhf ifne", // Your generated app password
      },
      debug: true, // Enable debug output
    });

    const mailOptions = {
      from: 'iccdtalentgate@gmail.com',
      to: recipientEmail,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('Error sending email');
  }
};

module.exports = { sendEmail };