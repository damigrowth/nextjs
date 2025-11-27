/**
 * Email Configuration
 *
 * Centralized configuration for all email metadata (from, to, subject, replyTo)
 * Separates presentation (HTML templates) from email routing and metadata
 */

import {
  SERVICE_CREATED_HTML,
  ServiceCreatedData,
} from './templates/service-created';
import {
  SERVICE_PUBLISHED_HTML,
  ServicePublishedData,
} from './templates/service-published';
import {
  CONTACT_ADMIN_HTML,
  CONTACT_CONFIRMATION_HTML,
  ContactEmailData,
} from './templates/contact';
import {
  NEW_VERIFICATION_HTML,
  NewVerificationData,
} from './templates/new-verification';
import {
  SERVICE_REPORT_HTML,
  ServiceReportData,
} from './templates/service-report';
import {
  PROFILE_REPORT_HTML,
  ProfileReportData,
} from './templates/profile-report';
import { NEW_PROFILE_HTML, NewProfileData } from './templates/new-profile';
import { VERIFICATION_HTML, VerificationData } from './templates/verification';
import { WELCOME_HTML, WelcomeData } from './templates/welcome';
import {
  PASSWORD_RESET_HTML,
  PasswordResetData,
} from './templates/password-reset';
import {
  SUPPORT_FEEDBACK_HTML,
  SupportFeedbackData,
} from './templates/support-feedback';

export interface EmailConfig<T = any> {
  to: string | ((data: T) => string);
  from: string | ((data: T) => string);
  replyTo?: string | null | ((data: T) => string | null);
  subject: string | ((data: T) => string);
  html: (data: T) => string;
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
  } as EmailConfig<ServiceCreatedData>,

  SERVICE_PUBLISHED: {
    to: (data: ServicePublishedData) => data.userEmail,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: ServicePublishedData) =>
      `Η υπηρεσία σας "${data.serviceTitle}" δημοσιεύτηκε!`,
    html: SERVICE_PUBLISHED_HTML,
  } as EmailConfig<ServicePublishedData>,

  // Contact Emails
  CONTACT_ADMIN: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: ContactEmailData) => data.email,
    subject: (data: ContactEmailData) =>
      `Νέα Φόρμα Επικοινωνίας - ${data.email}`,
    html: CONTACT_ADMIN_HTML,
  } as EmailConfig<ContactEmailData>,

  CONTACT_CONFIRMATION: {
    to: (data: ContactEmailData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: 'contact@doulitsa.gr',
    subject: () => 'Λάβαμε το μήνυμα σου!',
    html: CONTACT_CONFIRMATION_HTML,
  } as EmailConfig<ContactEmailData>,

  // Admin Notification Emails
  NEW_VERIFICATION: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: NewVerificationData) =>
      `Νέο Αίτημα Πιστοποίησης - ${data.displayName} (${data.userEmail})`,
    html: NEW_VERIFICATION_HTML,
  } as EmailConfig<NewVerificationData>,

  SERVICE_REPORT: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: ServiceReportData) => data.reporterEmail,
    subject: (data: ServiceReportData) =>
      `Αναφορά Υπηρεσίας - ${data.serviceTitle}`,
    html: SERVICE_REPORT_HTML,
  } as EmailConfig<ServiceReportData>,

  PROFILE_REPORT: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: ProfileReportData) => data.reporterEmail,
    subject: (data: ProfileReportData) =>
      `Αναφορά Προφίλ - ${data.profileName}`,
    html: PROFILE_REPORT_HTML,
  } as EmailConfig<ProfileReportData>,

  NEW_PROFILE: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: NewProfileData) =>
      `Νέο Επαγγελματικό Προφίλ - ${data.profileName} (${data.userEmail})`,
    html: NEW_PROFILE_HTML,
  } as EmailConfig<NewProfileData>,

  SUPPORT_FEEDBACK: {
    to: () => process.env.ADMIN_EMAIL || 'contact@doulitsa.gr',
    from: 'Admin Doulitsa <noreply@doulitsa.gr>',
    replyTo: (data: SupportFeedbackData) => data.reporterEmail,
    subject: (data: SupportFeedbackData) =>
      `${data.issueTypeLabel} από ${data.reporterName}`,
    html: SUPPORT_FEEDBACK_HTML,
  } as EmailConfig<SupportFeedbackData>,

  // Auth Emails
  VERIFICATION: {
    to: (data: VerificationData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: () => 'Επαληθεύστε το email σας - Doulitsa',
    html: VERIFICATION_HTML,
  } as EmailConfig<VerificationData>,

  WELCOME: {
    to: (data: WelcomeData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: WelcomeData) =>
      `Καλώς ήρθες στο Doulitsa, ${data.displayName || data.username || 'φίλε'}!`,
    html: WELCOME_HTML,
  } as EmailConfig<WelcomeData>,

  PASSWORD_RESET: {
    to: (data: PasswordResetData) => data.email,
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: () => 'Επαναφορά κωδικού πρόσβασης - Doulitsa',
    html: PASSWORD_RESET_HTML,
  } as EmailConfig<PasswordResetData>,
} as const;

export type EmailConfigKey = keyof typeof EMAIL_CONFIG;

// Helper function to get email config
export function getEmailConfig<K extends EmailConfigKey>(
  key: K,
): EmailConfig<any> {
  return EMAIL_CONFIG[key];
}
