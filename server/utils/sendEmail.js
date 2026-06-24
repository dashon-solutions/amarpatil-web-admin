const transporter = require("../config/smtp");

const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments || [],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
