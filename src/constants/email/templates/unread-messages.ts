/**
 * Unread Messages Email Template
 *
 * HTML template for notifying users of unread messages from the last 15 minutes
 */

import { formatMessageTime } from '@/lib/utils/formatting/time';

export interface UnreadMessagesData {
  userName: string;
  userEmail: string;
  unreadCount: number;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: {
      displayName: string | null;
      username: string | null;
      image: string | null;
    };
  }>;
  dashboardUrl?: string;
}

/**
 * Truncate message content to preview length
 */
function truncateMessage(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

/**
 * Get sender display name with fallback
 */
function getSenderName(author: {
  displayName: string | null;
  username: string | null;
}): string {
  return author.displayName || author.username || 'Χρήστης';
}

export const UNREAD_MESSAGES_HTML = (data: UnreadMessagesData): string => {
  const dashboardUrl =
    data.dashboardUrl || 'https://doulitsa.gr/dashboard/messages';

  // Show max 15 messages in chronological order (oldest first)
  const messagesToShow = data.messages.slice(0, 15).reverse();
  const hasMoreMessages = data.unreadCount > 15;

  // Generate message list HTML
  const messageListHTML =
    messagesToShow
      .map(
        (msg) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #1f4c40;">
            ${getSenderName(msg.author)}
            <span style="font-weight: normal; color: #999; font-size: 12px;">• ${formatMessageTime(msg.createdAt.toISOString())}</span>
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #333;">
            ${truncateMessage(msg.content, 120)}
          </p>
        </td>
      </tr>
    `,
      )
      .join('') +
    (hasMoreMessages
      ? `
      <tr>
        <td style="padding: 15px; text-align: center; background-color: #f9f9f9; border-top: 2px solid #eee;">
          <p style="margin: 0; font-size: 14px; color: #666; font-style: italic;">
            ... και ${data.unreadCount - 15} ακόμη ${data.unreadCount - 15 === 1 ? 'μήνυμα' : 'μηνύματα'}
          </p>
        </td>
      </tr>
    `
      : '');

  return `
<!DOCTYPE html>
<html lang="el">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Αδιάβαστα Μηνύματα - Doulitsa</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 0;">
          <table role="presentation" style="width: 602px; margin-top: 30px; margin-bottom: 30px; border-collapse: separate; border: 1px solid #cccccc; background-color: #ffffff; border-radius: 20px; overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="padding: 36px 30px 20px 30px;">
                <h1 style="font-size: 24px; margin: 0 0 10px 0; font-family: Arial, sans-serif; color: #1f4c40;">
                  ${data.unreadCount === 1 ? 'Νέο Μήνυμα' : 'Νέα Μηνύματα'}
                </h1>
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333;">
                  Γεια σου ${data.userName}!
                </p>
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; font-family: Arial, sans-serif; color: #333;">
                  Έχεις <strong>${data.unreadCount === 1 ? '1 αδιάβαστο μήνυμα' : `${data.unreadCount} αδιάβαστα μηνύματα`}</strong> από τα τελευταία 15 λεπτά.
                </p>
              </td>
            </tr>

            <!-- Messages List -->
            <tr>
              <td style="padding: 0 30px 20px 30px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9f9f9; border-radius: 8px; overflow: hidden;">
                  ${messageListHTML}
                </table>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td style="padding: 0 30px 36px 30px;">
                <a href="${dashboardUrl}" style="background: #1f4c40; color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 8px; display: inline-block; font-weight: 700; font-size: 16px;">
                  Δες τα Μηνύματά σου
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 30px; background: #000;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0;" align="left">
                      <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 16px; font-family: Arial, sans-serif; color: #ffffff;">
                        &reg; Doulitsa, 2025
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

/**
 * Plain text version of the email
 */
export const UNREAD_MESSAGES_TEXT = (data: UnreadMessagesData): string => {
  const dashboardUrl =
    data.dashboardUrl || 'https://doulitsa.gr/dashboard/messages';

  // Show max 15 messages in chronological order (oldest first)
  const messagesToShow = data.messages.slice(0, 15).reverse();
  const hasMoreMessages = data.unreadCount > 15;

  const messagesList =
    messagesToShow
      .map((msg) => {
        const senderName = getSenderName(msg.author);
        const time = formatMessageTime(msg.createdAt.toISOString());
        const content = truncateMessage(msg.content, 100);
        return `• ${senderName} (${time}): ${content}`;
      })
      .join('\n\n') +
    (hasMoreMessages
      ? `\n\n... και ${data.unreadCount - 15} ακόμη ${data.unreadCount - 15 === 1 ? 'μήνυμα' : 'μηνύματα'}`
      : '');

  return `
Νέα Μηνύματα - Doulitsa

Γεια σου ${data.userName}!

Έχεις ${data.unreadCount} αδιάβαστα μηνύματα από τα τελευταία 15 λεπτά:

${messagesList}

Δες όλα τα μηνύματά σου: ${dashboardUrl}

---
© Doulitsa, 2025
`;
};
