import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const sendVerificationEmail = async ({ to, username, verificationLink }) => {
  const subject = 'Verify your URL Shortener account';
  const text = `Hello ${username},\n\nPlease verify your email by opening this link:\n${verificationLink}\n\nThis link will expire in 24 hours.`;
  const html = `
    <h2>Verify your URL Shortener account</h2>
    <p>Hello ${username},</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verificationLink}">${verificationLink}</a></p>
    <p>This link will expire in 24 hours.</p>
  `;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log('\n================ EMAIL VERIFICATION LINK ================');
    console.log(`To: ${to}`);
    console.log(verificationLink);
    console.log('=========================================================\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
};
