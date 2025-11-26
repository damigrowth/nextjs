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
    name: string;
    email: string;
  },
  report: {
    reason: string;
    details: string;
  }
): Promise<void> {
  try {
    const emailData: ServiceReportData = {
      serviceTitle: service.title,
      serviceId: service.id.toString(),
      serviceSlug: service.slug,
      reporterName: reporter.name,
      reporterEmail: reporter.email,
      reportReason: report.reason,
      reportDetails: report.details,
      reportDate: new Date(),
    };

    // Get email configuration
    const config = EMAIL_CONFIG.SERVICE_REPORT;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
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
        attributes: {
          SERVICE_TITLE: service.title,
          SERVICE_ID: service.id.toString(),
          REPORTER_NAME: reporter.name,
          REPORTER_EMAIL: reporter.email,
          REPORT_REASON: report.reason,
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
    id: number;
    name: string;
  },
  reporter: {
    name: string;
    email: string;
  },
  report: {
    reason: string;
    details: string;
  }
): Promise<void> {
  try {
    const emailData: ProfileReportData = {
      profileName: profile.name,
      profileId: profile.id.toString(),
      reporterName: reporter.name,
      reporterEmail: reporter.email,
      reportReason: report.reason,
      reportDetails: report.details,
      reportDate: new Date(),
    };

    // Get email configuration
    const config = EMAIL_CONFIG.PROFILE_REPORT;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
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
        attributes: {
          PROFILE_NAME: profile.name,
          PROFILE_ID: profile.id.toString(),
          REPORTER_NAME: reporter.name,
          REPORTER_EMAIL: reporter.email,
          REPORT_REASON: report.reason,
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
    id: number;
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
      profileId: profile.id.toString(),
      userEmail: user.email,
      publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/profile/${profile.username}`,
      adminUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/admin/profiles/${profile.id}`,
      userType: user.type,
      createdAt: new Date(),
    };

    // Get email configuration
    const config = EMAIL_CONFIG.NEW_PROFILE;
    const to = typeof config.to === 'function' ? config.to(emailData) : config.to;
    const subject = typeof config.subject === 'function' ? config.subject(emailData) : config.subject;
    const message = config.html(emailData);
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
        attributes: {
          PROFILE_NAME: profile.name,
          PROFILE_ID: profile.id.toString(),
          USER_EMAIL: user.email,
          USER_TYPE: user.type,
        }
      }
    );

  } catch (error) {
    console.error('[Email] Failed to send new profile notification:', error);
  }
}
