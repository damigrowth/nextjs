/**
 * Email Templates Index
 *
 * Note: Service/Admin/Contact emails now use EMAIL_CONFIG from @/constants/email/email-config
 * This file exports HTML functions and legacy EMAIL_TEMPLATES for auth emails only
 */

import { VERIFICATION_HTML, VerificationData } from './verification';
import { WELCOME_HTML, WelcomeData } from './welcome';
import { PASSWORD_RESET_HTML, PasswordResetData } from './password-reset';
import type { EmailTemplate, EmailTemplateKey } from '@/lib/types/email';

// Export HTML functions
export * from './verification';
export * from './welcome';
export * from './password-reset';
export * from './contact';
export * from './service-created';
export * from './service-published';
export * from './new-verification';
export * from './service-report';
export * from './profile-report';
export * from './new-profile';
export * from './support-feedback';
export * from './unread-messages';

// Legacy EMAIL_TEMPLATES export for auth emails only
// TODO: Migrate auth emails to use EMAIL_CONFIG
export const EMAIL_TEMPLATES: Partial<Record<EmailTemplateKey, EmailTemplate>> = {
  VERIFICATION: {
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: 'Επαλήθευση λογαριασμού στη Doulitsa',
    html: (data: VerificationData) => VERIFICATION_HTML(data),
  },
  WELCOME: {
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: (data: WelcomeData) => `Καλώς ήρθες στο Doulitsa, ${data.displayName || data.username || 'φίλε'}!`,
    html: (data: WelcomeData) => WELCOME_HTML(data),
  },
  PASSWORD_RESET: {
    from: 'Doulitsa <noreply@doulitsa.gr>',
    replyTo: null,
    subject: 'Επαναφορά κωδικού πρόσβασης - Doulitsa',
    html: (data: PasswordResetData) => PASSWORD_RESET_HTML(data),
  },
};
