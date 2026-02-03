/**
 * Email Configuration
 *
 * Centralized configuration for all email metadata (from, to, subject, replyTo)
 * Separates presentation (HTML templates) from email routing and metadata
 */

import {
  SERVICE_CREATED_HTML,
  SERVICE_CREATED_TEXT,
  ServiceCreatedData,
} from './templates/service-created';
import {
  SERVICE_PUBLISHED_HTML,
  SERVICE_PUBLISHED_TEXT,
  ServicePublishedData,
} from './templates/service-published';
import {
  CONTACT_ADMIN_HTML,
  CONTACT_ADMIN_TEXT,
  CONTACT_CONFIRMATION_HTML,
  CONTACT_CONFIRMATION_TEXT,
  ContactEmailData,
} from './templates/contact';
import {
  NEW_VERIFICATION_HTML,
  NEW_VERIFICATION_TEXT,
  NewVerificationData,
} from './templates/new-verification';
import {
  SERVICE_REPORT_HTML,
  SERVICE_REPORT_TEXT,
  ServiceReportData,
} from './templates/service-report';
import {
  PROFILE_REPORT_HTML,
  PROFILE_REPORT_TEXT,
  ProfileReportData,
} from './templates/profile-report';
import { NEW_PROFILE_HTML, NEW_PROFILE_TEXT, NewProfileData } from './templates/new-profile';
import { VERIFICATION_HTML, VERIFICATION_TEXT, VerificationData } from './templates/verification';
import { WELCOME_HTML, WELCOME_TEXT, WelcomeData } from './templates/welcome';
import {
  PASSWORD_RESET_HTML,
  PASSWORD_RESET_TEXT,
  PasswordResetData,
} from './templates/password-reset';
import {
  SUPPORT_FEEDBACK_HTML,
  SUPPORT_FEEDBACK_TEXT,
  SupportFeedbackData,
} from './templates/support-feedback';
import {
  UNREAD_MESSAGES_HTML,
  UNREAD_MESSAGES_TEXT,
  UnreadMessagesData,
} from './templates/unread-messages';
import {
  REVIEW_APPROVED_HTML,
  REVIEW_APPROVED_TEXT,
  ReviewApprovedData,
} from './templates/review-approved';
import {
  NEW_REVIEW_HTML,
  NEW_REVIEW_TEXT,
  NewReviewData,
} from './templates/new-review';

export interface EmailConfig<T = any> {
  to: string | ((data: T) => string);
  from: string | ((data: T) => string);
  replyTo?: string | null | ((data: T) => string | null);
  subject: string | ((data: T) => string);
  html: (data: T) => string;
  text: (data: T) => string;
}

export const EMAIL_CONFIG = {
  // Service Emails
  SERVICE_CREATED: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: ServiceCreatedData) =>
      `Νέα Υπηρεσία - ${data.serviceTitle} - από ${data.creatorEmail}`,
    html: SERVICE_CREATED_HTML,
    text: SERVICE_CREATED_TEXT,
  } as EmailConfig<ServiceCreatedData>,

  SERVICE_PUBLISHED: {
    to: (data: ServicePublishedData) => data.userEmail,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: ServicePublishedData) =>
      `Η υπηρεσία σας "${data.serviceTitle}" δημοσιεύτηκε!`,
    html: SERVICE_PUBLISHED_HTML,
    text: SERVICE_PUBLISHED_TEXT,
  } as EmailConfig<ServicePublishedData>,

  // Contact Emails
  CONTACT_ADMIN: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: ContactEmailData) => data.email,
    subject: (data: ContactEmailData) =>
      `Νέα Φόρμα Επικοινωνίας - ${data.email}`,
    html: CONTACT_ADMIN_HTML,
    text: CONTACT_ADMIN_TEXT,
  } as EmailConfig<ContactEmailData>,

  CONTACT_CONFIRMATION: {
    to: (data: ContactEmailData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: 'contact@doulitsa.gr',
    subject: () => 'Λάβαμε το μήνυμα σου!',
    html: CONTACT_CONFIRMATION_HTML,
    text: CONTACT_CONFIRMATION_TEXT,
  } as EmailConfig<ContactEmailData>,

  // Admin Notification Emails
  NEW_VERIFICATION: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: NewVerificationData) =>
      `Νέο Αίτημα Πιστοποίησης - ${data.displayName} (${data.userEmail})`,
    html: NEW_VERIFICATION_HTML,
    text: NEW_VERIFICATION_TEXT,
  } as EmailConfig<NewVerificationData>,

  SERVICE_REPORT: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: ServiceReportData) => data.reporterEmail,
    subject: (data: ServiceReportData) =>
      `Αναφορά Υπηρεσίας - ${data.serviceTitle}`,
    html: SERVICE_REPORT_HTML,
    text: SERVICE_REPORT_TEXT,
  } as EmailConfig<ServiceReportData>,

  PROFILE_REPORT: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: ProfileReportData) => data.reporterEmail,
    subject: (data: ProfileReportData) =>
      `Αναφορά Προφίλ - ${data.profileName}`,
    html: PROFILE_REPORT_HTML,
    text: PROFILE_REPORT_TEXT,
  } as EmailConfig<ProfileReportData>,

  NEW_PROFILE: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: NewProfileData) =>
      `Νέο Επαγγελματικό Προφίλ - ${data.profileName} (${data.userEmail})`,
    html: NEW_PROFILE_HTML,
    text: NEW_PROFILE_TEXT,
  } as EmailConfig<NewProfileData>,

  SUPPORT_FEEDBACK: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: SupportFeedbackData) => data.reporterEmail,
    subject: (data: SupportFeedbackData) =>
      `${data.issueTypeLabel} από ${data.reporterName}`,
    html: SUPPORT_FEEDBACK_HTML,
    text: SUPPORT_FEEDBACK_TEXT,
  } as EmailConfig<SupportFeedbackData>,

  // Auth Emails
  VERIFICATION: {
    to: (data: VerificationData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: () => 'Επαληθεύστε το email σας - Doulitsa',
    html: VERIFICATION_HTML,
    text: VERIFICATION_TEXT,
  } as EmailConfig<VerificationData>,

  WELCOME: {
    to: (data: WelcomeData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: WelcomeData) =>
      `Καλώς ήρθες στο Doulitsa, ${data.displayName || data.username || 'φίλε'}!`,
    html: WELCOME_HTML,
    text: WELCOME_TEXT,
  } as EmailConfig<WelcomeData>,

  PASSWORD_RESET: {
    to: (data: PasswordResetData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: () => 'Επαναφορά κωδικού πρόσβασης - Doulitsa',
    html: PASSWORD_RESET_HTML,
    text: PASSWORD_RESET_TEXT,
  } as EmailConfig<PasswordResetData>,

  // Review Notifications (Admin)
  NEW_REVIEW: {
    to: () => 'domvournias@gmail.com', // TODO: revert to process.env.ADMIN_EMAIL || 'contact@doulitsa.gr'
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: NewReviewData) =>
      `Νέα Αξιολόγηση για ${data.receiverName}`,
    html: NEW_REVIEW_HTML,
    text: NEW_REVIEW_TEXT,
  } as EmailConfig<NewReviewData>,

  // Review Notifications (User)
  REVIEW_APPROVED: {
    to: (data: ReviewApprovedData) => data.profileOwnerEmail,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: () => 'Νέα Αξιολόγηση!',
    html: REVIEW_APPROVED_HTML,
    text: REVIEW_APPROVED_TEXT,
  } as EmailConfig<ReviewApprovedData>,

  // Message Notifications
  UNREAD_MESSAGES: {
    to: (data: UnreadMessagesData) => data.userEmail,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: UnreadMessagesData) =>
      data.unreadCount === 1
        ? `Έχεις 1 αδιάβαστο μήνυμα - Doulitsa`
        : `Έχεις ${data.unreadCount} αδιάβαστα μηνύματα - Doulitsa`,
    html: UNREAD_MESSAGES_HTML,
    text: UNREAD_MESSAGES_TEXT,
  } as EmailConfig<UnreadMessagesData>,
} as const;

export type EmailConfigKey = keyof typeof EMAIL_CONFIG;

// Helper function to get email config
export function getEmailConfig<K extends EmailConfigKey>(
  key: K,
): EmailConfig<any> {
  return EMAIL_CONFIG[key];
}
