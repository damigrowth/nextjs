/**
 * Email Route Handlers
 * Following Hono docs with proper zValidator usage
 */

import { zValidator } from '@hono/zod-validator';
import { sendEmailSchema } from '@/lib/api/validations.ts';
import { z } from 'zod';
import { successResponse } from '@/lib/api/responses.ts';
import { AppError } from '@/lib/errors';
import { EMAIL_TEMPLATES } from '@/constants/email/templates';

/**
 * Gmail REST API Client - Edge Runtime Compatible
 */

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
  
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Create JWT token for Service Account authentication
async function createJWT(): Promise<string> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
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
    sub: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Import private key for signing
  const privateKeyPem = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  // Parse PEM format
  const pemMatch = privateKeyPem.match(/-----BEGIN PRIVATE KEY-----\s*([\s\S]*?)\s*-----END PRIVATE KEY-----/);
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
    ['sign']
  );

  // Sign the JWT
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput)
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
      throw new Error(`Failed to get access token: ${response.status} ${error}`);
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
  const recipients = Array.isArray(mailOptions.to) ? mailOptions.to.join(', ') : mailOptions.to;
  
  const emailLines = [
    `To: ${recipients}`,
    `From: ${mailOptions.from}`,
    ...(mailOptions.replyTo ? [`Reply-To: ${mailOptions.replyTo}`] : []),
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(mailOptions.subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(mailOptions.html))),
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

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${response.status} ${error}`);
    }

    const result = await response.json();
    return {
      messageId: result.id,
      accepted: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
      rejected: [],
    };
  } catch (error) {
    console.error('Error sending email via Gmail API:', error);
    throw error;
  }
}

// Main email sending function
async function sendEmailEdge(mailOptions: {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // Check if Gmail Service Account is configured
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn('Gmail Service Account not configured - using mock email');
    return {
      messageId: 'mock-message-id',
      accepted: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
      rejected: [],
    };
  }

  return await sendGmailEmail(mailOptions);
}

/**
 * Get email template by type
 */
export const getEmailTemplate = (type: string, user: any, url?: string) => {
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
};

/**
 * Send authentication email using templates
 */
export const sendAuthEmail = async (type: string, user: any, url?: string) => {
  const emailData = getEmailTemplate(type, user, url);
  
  try {
    const info = await sendEmailEdge(emailData);
    console.log(`Email sent successfully: ${type} to ${user.email}`);
    
    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error(`Failed to send email: ${type} to ${user.email}`, error);
    throw error;
  }
};

/**
 * POST /send-email
 * Send email via Gmail REST API
 */
export const sendEmail = [
  zValidator('json', sendEmailSchema),
  async (c) => {
    try {
      const { to, from, replyTo, subject, html, text } = c.req.valid('json');

      const mailOptions = {
        from,
        to: Array.isArray(to) ? to : [to],
        replyTo,
        subject,
        html,
        ...(text && { text }),
      };

      const info = await sendEmailEdge(mailOptions);

      return successResponse(
        {
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
        },
        'Email sent successfully',
      );
    } catch (error) {
      console.error('Email sending error:', error);
      throw AppError.internal('Error sending email', {
        error: error.message,
      });
    }
  },
];

/**
 * POST /send-auth-email
 * Send authentication email using templates
 */
export const sendAuthEmailHandler = [
  zValidator('json', z.object({
    type: z.string().min(1, 'Email type is required'),
    user: z.object({
      email: z.string().email('Valid email is required'),
      id: z.string().optional(),
      name: z.string().optional(),
    }),
    url: z.string().url().optional(),
  })),
  async (c) => {
    try {
      const { type, user, url } = c.req.valid('json');
      
      const result = await sendAuthEmail(type, user, url);
      
      return successResponse(
        {
          messageId: result.messageId,
          accepted: result.accepted,
          rejected: result.rejected,
        },
        `Authentication email sent successfully: ${type}`,
      );
    } catch (error) {
      console.error('Authentication email sending error:', error);
      throw AppError.internal('Error sending authentication email', {
        error: error.message,
      });
    }
  },
];

/**
 * POST /send-bulk-email
 * Send bulk emails (admin only)
 */
export const sendBulkEmail = [
  zValidator(
    'json',
    sendEmailSchema.extend({
      to: sendEmailSchema.shape.to
        .array()
        .min(1, 'At least one recipient required'),
    }),
  ),
  async (c) => {
    try {
      const { to, from, replyTo, subject, html, text } = c.req.valid('json');
      const user = c.get('user');

      // Check if user has permission to send bulk emails
      if (user.type !== 0) {
        // Assuming 0 is admin
        throw AppError.forbidden('Insufficient permissions');
      }

      const results = [];
      const errors = [];

      // Send emails in batches to avoid overwhelming the Gmail API
      const batchSize = 10;
      const recipients = Array.isArray(to) ? to : [to];

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);

        const batchPromises = batch.map(async (recipient) => {
          try {
            const info = await sendEmailEdge({
              from,
              to: recipient,
              replyTo,
              subject,
              html,
              ...(text && { text }),
            });

            return {
              recipient,
              success: true,
              messageId: info.messageId,
            };
          } catch (error) {
            return {
              recipient,
              success: false,
              error: error.message,
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter((r) => r.success));
        errors.push(...batchResults.filter((r) => !r.success));

        // Small delay between batches
        if (i + batchSize < recipients.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return successResponse(
        {
          total: recipients.length,
          successful: results.length,
          failed: errors.length,
          results: results.map((r) => ({
            recipient: r.recipient,
            messageId: r.messageId,
          })),
          ...(errors.length > 0 && {
            errors: errors.map((e) => ({
              recipient: e.recipient,
              error: e.error,
            })),
          }),
        },
        `Bulk email completed: ${results.length} sent, ${errors.length} failed`,
      );
    } catch (error) {
      console.error('Bulk email error:', error);
      throw AppError.internal('Error sending bulk email');
    }
  },
];

/**
 * POST /test-email-connection
 * Test email server connection (admin only)
 */
export const testEmailConnection = async (c) => {
  try {
    const user = c.get('user');

    // Check if user has permission
    if (user.type !== 0) {
      // Assuming 0 is admin
      throw AppError.forbidden('Insufficient permissions');
    }

    // Test Gmail API connection by attempting to get access token
    try {
      await getAccessToken();
      
      return successResponse(
        {
          connected: true,
          service: 'Gmail REST API',
          serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          configured: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY),
        },
        'Gmail API connection test successful',
      );
    } catch (error) {
      throw new Error(`Gmail API connection failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Email connection test failed:', error);
    throw AppError.internal('Email connection test failed', {
      error: error.message,
    });
  }
};

/**
 * GET /email-templates
 * Get available email templates (admin only)
 */
export const getEmailTemplates = async (c) => {
  try {
    const user = c.get('user');

    // Check if user has permission
    if (user.type !== 0) {
      // Assuming 0 is admin
      throw AppError.forbidden('Insufficient permissions');
    }

    // This would typically come from a database or file system
    const templates = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{appName}}!',
        description: 'Sent to new users after registration',
      },
      {
        id: 'verification',
        name: 'Email Verification',
        subject: 'Verify your email address',
        description: 'Email verification link',
      },
      {
        id: 'password-reset',
        name: 'Password Reset',
        subject: 'Reset your password',
        description: 'Password reset instructions',
      },
      {
        id: 'notification',
        name: 'General Notification',
        subject: 'Notification from {{appName}}',
        description: 'General purpose notification email',
      },
    ];

    return successResponse(
      { templates },
      'Email templates retrieved successfully',
    );
  } catch (error) {
    console.error('Get email templates error:', error);
    throw AppError.internal('Failed to get email templates');
  }
};
