const nodemailer = require("nodemailer");

// Create the transporter once
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER_FOR_MAIL,
    pass: process.env.EMAIL_PASS_FOR_MAIL,
  },
});

/**
 * Generic function to send various types of emails
 */
const sendEmail = async (userEmail, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"LostLink Support" <${process.env.EMAIL_USER_FOR_MAIL}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent (${subject}): ` + info.response);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    throw error;
  }
};

/**
 * Specific templates for your different features
 */

// 1. Existing Welcome Email
const sendWelcomeEmail = (userEmail, userName) => {
  const html = `
    <div style="font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 600px;">
      <h2 style="color: #10b981;">Hi ${userName}, welcome aboard!</h2>
      <p>Thank you for joining LostLink. Your account is now verified.</p>
      <p>Start reporting lost items or helping your community today.</p>
    </div>`;
  return sendEmail(userEmail, "Welcome to LostLink!", html);
};

// 2. Signup / Forget Password OTP Email
const sendOTPEmail = (userEmail, otp, type = "verification") => {
  const title = type === "verification" ? "Verify Your Account" : "Reset Your Password";
  const message = type === "verification" 
    ? "Use the code below to verify your LostLink account:" 
    : "Use the code below to reset your password:";

  const html = `
    <div style="font-family: sans-serif; text-align: center; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 600px;">
      <h2 style="color: #3b82f6;">${title}</h2>
      <p>${message}</p>
      <h1 style="font-size: 40px; letter-spacing: 5px; color: #1e293b; margin: 20px 0;">${otp}</h1>
      <p style="color: #64748b; font-size: 14px;">This code is valid for 10 minutes.</p>
    </div>`;
  return sendEmail(userEmail, title, html);
};

module.exports = { sendWelcomeEmail, sendOTPEmail };