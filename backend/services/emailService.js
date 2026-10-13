import nodemailer from "nodemailer";

const requiredEmailConfig = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"];

export const sendPasswordResetOtp = async (email, otp) => {
  const missing = requiredEmailConfig.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Email service is not configured. Missing: ${missing.join(", ")}`);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Your Himapriya password reset OTP",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `<p>Your password reset OTP is:</p><h2>${otp}</h2><p>This OTP expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p>`,
  });
};
