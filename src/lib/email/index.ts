/**
 * Email Service Module
 * 
 * Centralized email functionality for the application.
 * Provides Gmail REST API integration and template-based email sending.
 */

export {
  sendEmail,
  sendAuthEmail,
  getEmailTemplate,
  testEmailConnection,
  type EmailOptions,
  type EmailResult,
  type AuthUser,
} from './service';

export {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAuthEmailGeneric,
} from './auth-integration';