import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const sendVerificationEmail = async ({ to, username, verificationLink }) => {
  const subject = 'Verify your URL Shortener account';

  const text = `Hello ${username},

Please verify your email by opening this link:
${verificationLink}

This link will expire in 24 hours.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Verify your URL Shortener account</h2>
      <p>Hello ${username},</p>
      <p>Please verify your email by clicking the link below:</p>
      <p>
        <a href="${verificationLink}" target="_blank">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.log('\n================ EMAIL VERIFICATION LINK ================');
    console.log(`To: ${to}`);
    console.log(verificationLink);
    console.log('=========================================================\n');

    return {
      sent: false,
      fallback: true,
    };
  }

  const smtpPort = Number(env.SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });

  return {
    sent: true,
    fallback: false,
  };
};