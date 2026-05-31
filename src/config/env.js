import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  REFRESH_TOKEN_DAYS: Number(process.env.REFRESH_TOKEN_DAYS || 7),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || 'URL Shortener <no-reply@example.com>',
};

if (!env.MONGO_URI) {
  throw new Error('MONGO_URI is missing. Add it to backend/.env');
}

if (!env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET is missing. Add it to backend/.env');
}
