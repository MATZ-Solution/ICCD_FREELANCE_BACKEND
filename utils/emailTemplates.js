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
        <p>Thank you for applying to <strong>${companyName}</strong>.</p>
        <p>After careful consideration, we regret to inform you that you were not selected for this position.</p>
        <p>We truly appreciate your interest and encourage you to apply for future opportunities.</p>
        <br>
        <p>Wishing you success ahead,</p>
        <p><strong>${companyName} Recruitment Team</strong></p>
      </div>
    `
  }
};

module.exports = { emailTemplates };
