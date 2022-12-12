// IMPORT NODEMAILER TO SEND EMAIL TO USERS
const nodemailer = require("nodemailer");

// Create a function responsible for sending email
const sendEmail = async (emailOptions) => {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Create mail option object
  const mailOptions = {
    from: "Manara Ali <manaraali63@gmail.com>",
    to: emailOptions.email,
    subject: emailOptions.subject,
    text: emailOptions.message,
  };

  // 3. Call the function to send email
  await transporter.sendMail(mailOptions);
};

// EXPORT THE EMAIL FUNCTION TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = sendEmail;
