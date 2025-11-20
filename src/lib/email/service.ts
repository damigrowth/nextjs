/**
 * Gmail REST API Email Service
 *
 * Server-side email utility using Gmail REST API with Service Account authentication.
 * Extracted from legacy Hono handler and optimized for server actions.
 */

import { EMAIL_TEMPLATES } from '@/constants/email/templates';
import {
  EmailTemplateKey,
  EmailTemplate,
  EmailUser,
  EmailResult,
  EmailOptions,
} from '@/lib/types/email';

// Base64 encode for URL-safe JWT
function base64urlEncode(input: string | ArrayBuffer): string {
  let str: string;

  if (typeof input === 'string') {
    // Convert string to UTF-8 bytes first
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    const binaryString = String.fromCharCode.apply(null, Array.from(bytes));
    str = btoa(binaryString);
  } else {
    // Handle ArrayBuffer (from crypto.subtle.sign)
    const bytes = new Uint8Array(input);
    const binaryString = String.fromCharCode.apply(null, Array.from(bytes));
    str = btoa(binaryString);
  }

  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Create JWT token for Service Account authentication
async function createJWT(): Promise<string> {
  if (
    !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY
  ) {
    throw new Error('Google Service Account credentials not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600, // 1 hour
    iat: now,
    sub:
      process.env.GOOGLE_CLIENT_EMAIL ||
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Import private key for signing
  const privateKeyPem = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  // Parse PEM format
  const pemMatch = privateKeyPem.match(
    /-----BEGIN PRIVATE KEY-----\s*([\s\S]*?)\s*-----END PRIVATE KEY-----/,
  );
  if (!pemMatch) {
    throw new Error('Invalid PEM format in private key');
  }

  const pemContents = pemMatch[1].replace(/\s/g, '');

  // Decode base64 to binary
  const binaryString = atob(pemContents);
  const keyData = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    keyData[i] = binaryString.charCodeAt(i);
  }

  // Import the key
  const key = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );

  // Convert signature to base64url
  const encodedSignature = base64urlEncode(signature);

  return `${signingInput}.${encodedSignature}`;
}

// Get OAuth2 access token
async function getAccessToken(): Promise<string> {
  try {
    const jwt = await createJWT();

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Failed to get access token: ${response.status} ${error}`,
      );
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Create email message for Gmail API
function createEmailMessage(mailOptions: {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
}): string {
  const recipients = Array.isArray(mailOptions.to)
    ? mailOptions.to.join(', ')
    : mailOptions.to;

  // Helper to safely encode UTF-8 strings to base64
  const utf8ToBase64 = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    const binary = String.fromCharCode(...bytes);
    return btoa(binary);
  };

  const emailLines = [
    `To: ${recipients}`,
    `From: ${mailOptions.from}`,
    ...(mailOptions.replyTo ? [`Reply-To: ${mailOptions.replyTo}`] : []),
    `Subject: =?UTF-8?B?${utf8ToBase64(mailOptions.subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64(mailOptions.html),
  ];

  return emailLines.join('\r\n');
}

// Send email via Gmail REST API
async function sendGmailEmail(mailOptions: {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const accessToken = await getAccessToken();
    const emailMessage = createEmailMessage(mailOptions);

    // Use URL-safe base64 encoding for email messages (Gmail API requirement)
    const encodedMessage = btoa(emailMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${response.status} ${error}`);
    }

    const result = await response.json();
    return {
      messageId: result.id,
      accepted: Array.isArray(mailOptions.to)
        ? mailOptions.to
        : [mailOptions.to],
      rejected: [],
    };
  } catch (error) {
    console.error('Error sending email via Gmail API:', error);
    throw error;
  }
}

/**
 * Main email sending function
 */
export async function sendEmail(
  mailOptions: EmailOptions,
): Promise<EmailResult> {
  // Check if Gmail Service Account is configured
  if (
    !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY
  ) {
    console.warn('Gmail Service Account not configured - using mock email');
    return {
      messageId: 'mock-message-id',
      accepted: Array.isArray(mailOptions.to)
        ? mailOptions.to
        : [mailOptions.to],
      rejected: [],
    };
  }

  return await sendGmailEmail(mailOptions);
}

/**
 * Get email template by type
 */
export function getEmailTemplate(type: string, user: EmailUser, url?: string) {
  const template = EMAIL_TEMPLATES[type];
  if (!template) {
    throw new Error(`Template type "${type}" not found.`);
  }

  return {
    to: user.email,
    from: template.from,
    replyTo: template.replyTo,
    subject: template.subject,
    html: template.html(user, url),
  };
}

/**
 * Send authentication email using templates
 */
export async function sendAuthEmail(
  type: string,
  user: EmailUser,
  url?: string,
): Promise<EmailResult> {
  const emailData = getEmailTemplate(type, user, url);

  try {
    const info = await sendEmail(emailData);
    // console.log(`Email sent successfully: ${type} to ${user.email}`);

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error(`Failed to send email: ${type} to ${user.email}`, error);
    throw error;
  }
}

/**
 * Send template-based email for forms and other purposes
 */
export async function sendTemplateEmail(
  templateKey: EmailTemplateKey,
  to: string | string[],
  data: any,
  options?: {
    from?: string;
    replyTo?: string;
  },
): Promise<EmailResult> {
  const template = EMAIL_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Template "${templateKey}" not found.`);
  }

  // Build email data
  const emailData: EmailOptions = {
    to,
    from: options?.from || template.from,
    replyTo: options?.replyTo || template.replyTo || undefined,
    subject:
      typeof template.subject === 'function'
        ? template.subject(data)
        : template.subject,
    html:
      typeof template.html === 'function' ? template.html(data) : template.html,
  };

  try {
    const info = await sendEmail(emailData);
    // console.log(
    //   `Template email sent successfully: ${templateKey} to ${Array.isArray(to) ? to.join(', ') : to}`,
    // );

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error(`Failed to send template email: ${templateKey}`, error);
    throw error;
  }
}

/**
 * Test email connection (for admin use)
 */
export async function testEmailConnection(): Promise<{
  connected: boolean;
  service: string;
  serviceAccount?: string;
  configured: boolean;
}> {
  try {
    await getAccessToken();

    return {
      connected: true,
      service: 'Gmail REST API',
      serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      configured: !!(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_PRIVATE_KEY
      ),
    };
  } catch (error) {
    throw new Error(`Gmail API connection failed: ${error.message}`);
  }
}

// Export types for use in other modules
export type { EmailOptions, EmailResult, EmailUser };
