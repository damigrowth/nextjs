/**
 * Contact Form Email Functions
 *
 * Modular email service for contact form notifications using templates
 */

import { sendWorkflowEmail } from '../workflow-config';
import { BrevoTransactional } from '../providers/brevo/types';
import { EMAIL_CONFIG } from '@/constants/email/email-config';
import type { ContactEmailData } from '@/lib/types/email';

/**
 * Send contact form notification to admin
 * Notifies admin about new contact form submission
 */
export async function sendContactAdminEmail(
  data: ContactEmailData
): Promise<void> {
  try {
    // Get email configuration
    const config = EMAIL_CONFIG.CONTACT_ADMIN;
    const to = typeof config.to === 'function' ? config.to(data) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(data) : config.subject;
    const message = config.html(data);
    const textMessage = config.text(data);
    const from = typeof config.from === 'function' ? config.from(data) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(data) : config.replyTo)
      : undefined;

    // Send contact form email to admin via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.CONTACT_ADMIN,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          CONTACT_NAME: data.name,
          CONTACT_EMAIL: data.email,
          CONTACT_MESSAGE: data.message,
          CONTACT_ID: data.contactId?.toString() || '',
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send contact admin notification:', error);
    throw error; // Re-throw for contact action to handle
  }
}

/**
 * Send confirmation email to contact form submitter
 */
export async function sendContactConfirmationEmail(
  data: ContactEmailData
): Promise<void> {
  try {
    // Get email configuration
    const config = EMAIL_CONFIG.CONTACT_CONFIRMATION;
    const to = typeof config.to === 'function' ? config.to(data) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(data) : config.subject;
    const message = config.html(data);
    const textMessage = config.text(data);
    const from = typeof config.from === 'function' ? config.from(data) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(data) : config.replyTo)
      : undefined;

    // Send contact confirmation email to user via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.CONTACT_ADMIN, // Using CONTACT_ADMIN temporarily for confirmation too
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          CONTACT_NAME: data.name,
          CONTACT_EMAIL: data.email,
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send contact confirmation:', error);
    // Don't re-throw for confirmation email - it's not critical
  }
}

/**
 * Send both contact form emails (admin notification + user confirmation)
 */
export async function sendContactFormEmails(
  data: ContactEmailData
): Promise<void> {
  try {
    // Send admin notification (critical)
    await sendContactAdminEmail(data);

    // Send user confirmation (non-critical)
    await sendContactConfirmationEmail(data);
  } catch (error) {
    console.error('[Email] Failed to send contact form emails:', error);
    throw error; // Re-throw if admin email fails
  }
}
