/**
 * Email Service Module
 *
 * Centralized email functionality for the application using Brevo.
 */

// Export auth integration functions (for Better Auth)
export {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAuthEmailGeneric,
} from './auth-integration';

// Export modular email services
export * from './services';

// Export workflow configuration
export { sendWorkflowEmail } from './workflow-config';

// Export Brevo-specific functionality
export {
  brevoClient,
  brevoWorkflowService,
  BrevoWorkflow,
  type BrevoConfig,
  type DoulitsaContactAttributes,
} from './providers/brevo';