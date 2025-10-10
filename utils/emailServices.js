// emailService.js
const nodemailer = require('nodemailer');

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "matzsolutions.com",
      port: 465,
      secure: true,
      auth: {
        user: "noreplyiccd@matzsolutions.com", // Your Gmail address
        pass: "jU;T7l+_d.H3", // Your generated app password
      },
      debug: true, // Enable debug output
    });

    const mailOptions = {
      from: "noreplyiccd@matzsolutions.com",
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
