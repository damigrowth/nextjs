/**
 * Admin Email Functions
 *
 * Modular email service for admin notifications using templates
 */

import { sendWorkflowEmail } from '../workflow-config';
import { BrevoWorkflow, BrevoTransactional } from '../providers/brevo/types';
import { EMAIL_CONFIG } from '@/constants/email/email-config';
import type { NewVerificationData } from '@/constants/email/templates/new-verification';
import type { ServiceReportData } from '@/constants/email/templates/service-report';
import type { ProfileReportData } from '@/constants/email/templates/profile-report';
import type { NewProfileData } from '@/constants/email/templates/new-profile';
import type { SupportFeedbackData } from '@/constants/email/templates/support-feedback';
import type { NewReviewData } from '@/constants/email/templates/new-review';

/**
 * Send email notification when a user requests verification
 * Notifies admin about the verification request
 */
export async function sendNewVerificationEmail(
  user: {
    email: string;
    displayName?: string | null;
    username?: string | null;
  },
  profileId: string,
  verificationId: string
): Promise<void> {
  try {
    const displayName = user.displayName || user.username || 'Unknown';

    const emailData: NewVerificationData = {
      displayName,
      userEmail: user.email,
      profileId,
      verificationId,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.NEW_VERIFICATION;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to admin via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.NEW_VERIFICATION,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          DISPLAY_NAME: displayName,
          USER_EMAIL: user.email,
          PROFILE_ID: profileId,
          VERIFICATION_ID: verificationId,
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send new verification notification:', error);
  }
}

/**
 * Send email notification when a service is reported
 * Notifies admin about the service report
 */
export async function sendServiceReportEmail(
  service: {
    id: number;
    title: string;
    slug: string;
  },
  reporter: {
    id: string;
    name: string;
    email: string;
    username: string;
  },
  report: {
    details: string;
  },
  servicePageUrl: string
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr';

    const emailData: ServiceReportData = {
      serviceId: service.id.toString(),
      serviceTitle: service.title,
      serviceSlug: service.slug,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reporterEmail: reporter.email,
      reporterUsername: reporter.username,
      reportDetails: report.details,
      reportDate: new Date(),
      servicePageUrl,
      serviceAdminUrl: `${baseUrl}/admin/services/${service.id}`,
      reporterAdminUrl: `${baseUrl}/admin/profiles/${reporter.id}`,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.SERVICE_REPORT;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to admin via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.SERVICE_REPORT,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          SERVICE_TITLE: service.title,
          SERVICE_ID: service.id.toString(),
          REPORTER_NAME: reporter.name,
          REPORTER_EMAIL: reporter.email,
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send service report notification:', error);
  }
}

/**
 * Send email notification when a profile is reported
 * Notifies admin about the profile report
 */
export async function sendProfileReportEmail(
  profile: {
    id: string;
    name: string;
    email: string;
    username: string;
  },
  reporter: {
    id: string;
    name: string;
    email: string;
    username: string;
  },
  report: {
    details: string;
  },
  profilePageUrl: string
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr';

    const emailData: ProfileReportData = {
      profileId: profile.id,
      profileName: profile.name,
      profileEmail: profile.email,
      profileUsername: profile.username,
      reporterId: reporter.id,
      reporterName: reporter.name,
      reporterEmail: reporter.email,
      reporterUsername: reporter.username,
      reportDetails: report.details,
      reportDate: new Date(),
      profilePageUrl,
      reportedUserAdminUrl: `${baseUrl}/admin/users/${profile.id}`,
      reporterAdminUrl: `${baseUrl}/admin/profiles/${reporter.id}`,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.PROFILE_REPORT;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to admin via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.PROFILE_REPORT,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          PROFILE_NAME: profile.name,
          PROFILE_ID: profile.username,
          REPORTER_NAME: reporter.name,
          REPORTER_EMAIL: reporter.email,
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send profile report notification:', error);
  }
}

/**
 * Send email notification when a new profile is created after onboarding
 * Notifies admin about the new profile and adds to profiles list
 */
export async function sendNewProfileEmail(
  profile: {
    id: string;
    name: string;
    username: string;
  },
  user: {
    email: string;
    type: string;
  }
): Promise<void> {
  try {
    const emailData: NewProfileData = {
      profileName: profile.name,
      displayName: profile.name,
      username: profile.username,
      profileId: profile.id,
      userEmail: user.email,
      publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/profile/${encodeURIComponent(profile.username)}`,
      adminUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/admin/profiles/${profile.id}`,
      userType: user.type,
      createdAt: new Date(),
    };

    // Get email configuration
    const config = EMAIL_CONFIG.NEW_PROFILE;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to admin via Brevo workflow
    await sendWorkflowEmail(
      BrevoWorkflow.NEW_PROFILE,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          PROFILE_NAME: profile.name,
          PROFILE_ID: profile.id,
          USER_EMAIL: user.email,
          USER_TYPE: user.type,
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send new profile notification:', error);
  }
}

/**
 * Send email notification when a user submits support/feedback
 * Notifies admin about the support request
 */
export async function sendSupportFeedbackEmail(
  reporter: {
    id: string;
    name: string;
    email: string;
    username: string;
  },
  feedback: {
    issueType: 'problem' | 'option' | 'feature';
    description: string;
  },
  pageUrl: string
): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr';

    // Get Greek label for issue type
    const issueTypeLabels = {
      problem: 'Αναφορά Προβλήματος',
      option: 'Προσθήκη μιας νέας επιλογής',
      feature: 'Πρόταση νέας δυνατότητας',
    };

    const emailData: SupportFeedbackData = {
      reporterId: reporter.id,
      reporterName: reporter.name,
      reporterEmail: reporter.email,
      reporterUsername: reporter.username,
      issueType: feedback.issueType,
      issueTypeLabel: issueTypeLabels[feedback.issueType],
      description: feedback.description,
      submitDate: new Date(),
      pageUrl,
      reporterAdminUrl: `${baseUrl}/admin/users/${reporter.id}`,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.SUPPORT_FEEDBACK;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to admin via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.SUPPORT_FEEDBACK,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          REPORTER_NAME: reporter.name,
          REPORTER_EMAIL: reporter.email,
          ISSUE_TYPE: issueTypeLabels[feedback.issueType],
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send support feedback notification:', error);
  }
}

/**
 * Send email notification when a user submits a new review
 * Notifies admin about the pending review for moderation
 */
export async function sendNewReviewEmail(
  review: {
    id: string;
    rating: number;
    comment?: string | null;
    type: 'PROFILE' | 'SERVICE';
    serviceName?: string | null;
  },
  author: {
    name: string;
    email: string;
  },
  receiver: {
    displayName: string;
    username: string;
    email: string;
  }
): Promise<void> {
  try {
    const emailData: NewReviewData = {
      reviewId: review.id,
      authorName: author.name,
      authorEmail: author.email,
      receiverName: receiver.displayName,
      receiverUsername: receiver.username,
      receiverEmail: receiver.email,
      rating: review.rating,
      comment: review.comment,
      reviewType: review.type,
      serviceName: review.serviceName,
    };

    // Get email configuration
    const config = EMAIL_CONFIG.NEW_REVIEW;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
    const textMessage = config.text(emailData);
    const from = typeof config.from === 'function' ? config.from(emailData) : config.from;
    const replyTo = config.replyTo
      ? (typeof config.replyTo === 'function' ? config.replyTo(emailData) : config.replyTo)
      : undefined;

    // Send email to admin via Brevo transactional
    await sendWorkflowEmail(
      BrevoTransactional.NEW_REVIEW,
      to,
      subject,
      message,
      {
        from,
        replyTo,
        text: textMessage,
        attributes: {
          AUTHOR_NAME: author.name,
          AUTHOR_EMAIL: author.email,
          RECEIVER_NAME: receiver.displayName,
          REVIEW_ID: review.id,
          RATING: review.rating.toString(),
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send new review notification:', error);
  }
}
