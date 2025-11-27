/**
 * Message-Related Email Functions
 *
 * Modular email service for all message-related notifications
 * Encapsulates email logic away from server actions
 */

import { sendWorkflowEmail } from '../workflow-config';
import { BrevoTransactional } from '../providers/brevo/types';
import { EMAIL_CONFIG } from '@/constants/email/email-config';
import type { UnreadMessagesData } from '@/constants/email/templates/unread-messages';

/**
 * Send email notification for unread messages from the last N minutes
 * Notifies user when they have 15+ unread messages in the last 15 minutes
 */
export async function sendUnreadMessagesEmail(
  user: {
    id: string;
    email: string;
    displayName?: string | null;
    username?: string | null;
  },
  recentMessages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    chatId: string;
    author: {
      id: string;
      displayName: string | null;
      username: string | null;
      image: string | null;
    };
  }>
): Promise<void> {
  try {
    const userName = user.displayName || user.username || 'φίλε';

    const emailData: UnreadMessagesData = {
      userName,
      userEmail: user.email,
      unreadCount: recentMessages.length,
      messages: recentMessages,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/dashboard/messages`,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.UNREAD_MESSAGES;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to user via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.UNREAD_MESSAGES,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          USER_NAME: userName,
          UNREAD_COUNT: recentMessages.length,
        }
      }
    );

    console.log(`[Email] Unread messages email sent to ${user.email} (${recentMessages.length} messages)`);
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the operation
    console.error('[Email] Failed to send unread messages notification:', error);

    // Optionally, you could track failed emails in a database table for retry
    // await trackFailedEmail('UNREAD_MESSAGES', { userId: user.id, error });
  }
}
