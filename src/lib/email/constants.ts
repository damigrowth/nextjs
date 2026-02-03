/**
 * Email Tags for Brevo Statistics Tracking
 *
 * These tags are used to categorize and track different types of emails
 * in the Brevo dashboard for analytics purposes.
 */

export const EMAIL_TAGS = {
  // Admin notifications
  SERVICE_CREATED: 'service-created',
  CONTACT_FORM_ADMIN: 'contact-admin',
  VERIFICATION_REQUEST: 'verification-request',
  ABUSE_REPORT: 'abuse-report',

  // User notifications
  CONTACT_FORM_USER: 'contact-confirmation',
  SERVICE_PUBLISHED: 'service-published',
  NEW_REVIEW: 'new-review',
  REVIEW_APPROVED: 'review-approved',

  // Authentication emails
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  WELCOME: 'welcome',

  // User journey (workflows)
  NEW_PROFILE: 'new-profile',
  CHAT_DIGEST: 'chat-digest',
} as const;

export type EmailTag = typeof EMAIL_TAGS[keyof typeof EMAIL_TAGS];