// utils/emailTemplates.js
const emailTemplates = {
  jobAccepted: {
    subject: "🎉 Congratulations! You’ve Been Selected for the Next Stage",
    html: (candidateName) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Congratulations, ${candidateName}!</h2>
        <p>Our team was impressed with your profile and we’re excited to move forward with you.</p>
        <p>You’ll receive further details about the next steps soon.</p>
        <br>
      </div>
    `
  },

  jobRejected: {
    subject: "Update on Your Application Status",
    html: (candidateName, companyName) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #f44336;">Application Update</h2>
        <p>Dear ${candidateName},</p>
        <p>After careful consideration, we regret to inform you that you were not selected for this position.</p>
        <p>We truly appreciate your interest and encourage you to apply for future opportunities.</p>
        <br>
        <p>Wishing you success ahead,</p>
      </div>
    `
  },
  
  issueReported: {
    subject: "🚨 Issue Report Received — We’re On It!",
    html: (userName, issueTitle) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #ff9800;">Thank You, ${userName}</h2>
        <p>We’ve received your report regarding: <strong>${issueTitle}</strong>.</p>
        <p>Our support team is reviewing the issue and will get back to you as soon as possible.</p>
        <p>We appreciate your patience and for helping us improve our platform.</p>
        <br>
        <p>— ICCD Talent Gate Support Team</p>
      </div>
    `
  },

  feedbackReceived: {
    subject: "💬 Thank You for Your Feedback!",
    html: (userName) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2196F3;">We Appreciate Your Feedback, ${userName}!</h2>
        <p>Your thoughts and suggestions help us make ICCD Talent Gate better every day.</p>
        <p>Our team will review your feedback and take it into consideration for future improvements.</p>
        <br>
        <p>Thank you for taking the time to share your experience!</p>
      </div>
    `
  },

  contactMessage: {
    subject: "📩 Thank You for Contacting Us",
    html: (userName) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4CAF50;">Hello ${userName},</h2>
        <p>We’ve received your message and our team will get in touch with you shortly.</p>
        <p>We appreciate you reaching out to us and we’ll do our best to respond promptly.</p>
        <br>
        <p>Warm regards,</p>
        <p><strong>ICCD Talent Gate Team</strong></p>
      </div>
    `
  }
};

module.exports = { emailTemplates };
