/**
 * Review-Related Email Functions
 *
 * Modular email service for review notifications
 */

import { sendWorkflowEmail } from '../workflow-config';
import { BrevoTransactional } from '../providers/brevo/types';
import { EMAIL_CONFIG } from '@/constants/email/email-config';
import type { ReviewApprovedData } from '@/constants/email/templates/review-approved';

/**
 * Send email notification when a review is approved by admin
 * Notifies the profile owner about the new approved review.
 * If the review has a comment, prompts the owner to approve it for public display.
 */
export async function sendReviewApprovedEmail(
  review: {
    rating: number;
    comment?: string | null;
    reviewerName: string;
    serviceName?: string | null;
  },
  profileOwner: {
    email: string;
    displayName?: string | null;
    username?: string | null;
  }
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr';
    const profileOwnerName = profileOwner.displayName || profileOwner.username || 'φίλε';

    const emailData: ReviewApprovedData = {
      profileOwnerName,
      profileOwnerEmail: profileOwner.email,
      reviewerName: review.reviewerName,
      rating: review.rating,
      comment: review.comment,
      serviceName: review.serviceName,
      dashboardUrl: `${baseUrl}/dashboard/reviews`,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.REVIEW_APPROVED;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to profile owner via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.REVIEW_APPROVED,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          PROFILE_OWNER_NAME: profileOwnerName,
          REVIEWER_NAME: review.reviewerName,
          RATING: review.rating.toString(),
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send review approved notification:', error);
  }
}
