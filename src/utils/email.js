import { google } from 'googleapis';
import { env } from '../config/env.js';

const encodeMessage = (message) => {
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const createRawEmail = ({ to, from, subject, html }) => {
  const message = [
    `From: URL Shortener <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\n');

  return encodeMessage(message);
};

export const sendVerificationEmail = async ({ to, username, verificationLink }) => {
  console.log('[EMAIL] sendVerificationEmail called');
  console.log('[EMAIL] To:', to);
  console.log('[EMAIL] GMAIL_FROM:', env.GMAIL_FROM);

  console.log('[EMAIL] Env check:', {
    hasGoogleClientId: Boolean(env.GOOGLE_CLIENT_ID),
    hasGoogleClientSecret: Boolean(env.GOOGLE_CLIENT_SECRET),
    hasGoogleRefreshToken: Boolean(env.GOOGLE_REFRESH_TOKEN),
    hasGmailFrom: Boolean(env.GMAIL_FROM),
    clientUrl: env.CLIENT_URL,
  });

  const subject = 'Verify your URL Shortener account';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Verify your URL Shortener account</h2>
      <p>Hello ${username},</p>
      <p>Please verify your email by clicking the button below:</p>

      <p>
        <a
          href="${verificationLink}"
          style="
            display:inline-block;
            padding:12px 18px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
          "
        >
          Verify Email
        </a>
      </p>

      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>

      <p>This link will expire in 24 hours.</p>
    </div>
  `;

  if (
    !env.GOOGLE_CLIENT_ID ||
    !env.GOOGLE_CLIENT_SECRET ||
    !env.GOOGLE_REFRESH_TOKEN ||
    !env.GMAIL_FROM
  ) {
    console.log('[EMAIL] Missing Gmail API variables. Falling back to log link.');
    console.log('\n================ EMAIL VERIFICATION LINK ================');
    console.log(`To: ${to}`);
    console.log(verificationLink);
    console.log('=========================================================\n');

    return {
      sent: false,
      fallback: true,
    };
  }

  try {
    console.log('[EMAIL] Creating OAuth2 client...');

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    });

    console.log('[EMAIL] Creating Gmail client...');

    const gmail = google.gmail({
      version: 'v1',
      auth: oauth2Client,
    });

    const raw = createRawEmail({
      to,
      from: env.GMAIL_FROM,
      subject,
      html,
    });

    console.log('[EMAIL] Sending Gmail API message...');

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
      },
    });

    console.log('[EMAIL] Gmail API send success:', {
      messageId: result.data.id,
      threadId: result.data.threadId,
    });

    return {
      sent: true,
      fallback: false,
      id: result.data.id,
    };
  } catch (error) {
    console.error('[EMAIL] Gmail API send failed');

    console.error('[EMAIL] Error message:', error.message);

    if (error.code) {
      console.error('[EMAIL] Error code:', error.code);
    }

    if (error.response?.data) {
      console.error('[EMAIL] Google error response:', JSON.stringify(error.response.data, null, 2));
    }

    console.log('\n================ EMAIL VERIFICATION LINK ================');
    console.log(`To: ${to}`);
    console.log(verificationLink);
    console.log('=========================================================\n');

    return {
      sent: false,
      fallback: true,
      error: error.message,
    };
  }
};