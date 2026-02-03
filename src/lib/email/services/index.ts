/**
 * Email Services Module
 *
 * Centralized export for all email service functions
 * Provides modular, reusable email functionality
 */

// Service-related emails
export {
  sendServiceCreatedEmail,
  sendServicePublishedEmail,
  sendServiceApprovedEmail,
  sendServiceExpiringEmail,
  sendServiceReviewEmail,
  sendBulkServiceEmails,
} from './service-emails';

// Admin notification emails
export {
  sendNewVerificationEmail,
  sendServiceReportEmail,
  sendProfileReportEmail,
  sendNewProfileEmail,
  sendNewReviewEmail,
} from './admin-emails';

// Review notification emails
export {
  sendReviewApprovedEmail,
} from './review-emails';

// Contact form emails
export {
  sendContactAdminEmail,
  sendContactConfirmationEmail,
  sendContactFormEmails,
} from './contact-emails';

// Re-export auth emails for convenience (they're already modular)
export {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAuthEmailGeneric,
} from '../auth-integration';