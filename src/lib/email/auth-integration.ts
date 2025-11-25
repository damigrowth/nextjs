/**
 * Email Integration for Better Auth
 *
 * Simplified functions for Better Auth integration using Brevo workflows.
 * These can be called from auth configuration or client-side code.
 */

import { sendWorkflowEmail } from './workflow-config';
import { BrevoWorkflow } from './providers/brevo/types';
import { EMAIL_TEMPLATES, VerificationData, PasswordResetData, WelcomeData } from '@/constants/email/templates';
import { EmailUser } from '@/lib/types/email';

/**
 * Send verification email for Better Auth
 */
export async function sendVerificationEmail(
  userEmail: string,
  displayName?: string,
  username?: string,
  verificationUrl?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data: VerificationData = {
      email: userEmail,
      displayName,
      username,
      url: verificationUrl || '',
    };

    // Render the verification template
    const template = EMAIL_TEMPLATES.VERIFICATION;
    const subject = typeof template.subject === 'function'
      ? template.subject(data)
      : template.subject;
    const message = typeof template.html === 'function'
      ? template.html(data)
      : template.html;

    // Send via Brevo workflow (using USER_REGISTRATION workflow for now)
    // TODO: Create VERIFICATION workflow in Brevo if needed
    await sendWorkflowEmail(
      BrevoWorkflow.USER_REGISTRATION,
      userEmail,
      subject,
      message,
      {
        attributes: {
          USER_NAME: displayName || username || '',
          VERIFICATION_URL: verificationUrl || '',
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error(`Failed to send verification email to ${userEmail}:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send verification email',
    };
  }
}

/**
 * Send welcome email for Better Auth
 */
export async function sendWelcomeEmail(
  userEmail: string,
  displayName?: string,
  username?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = {
      email: userEmail,
      displayName,
      username,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://doulitsa.gr'}/dashboard`,
    };

    // Render the welcome template
    const template = EMAIL_TEMPLATES.WELCOME;
    const subject = typeof template.subject === 'function'
      ? template.subject(data)
      : template.subject;
    const message = typeof template.html === 'function'
      ? template.html(data)
      : template.html;

    // Send via Brevo workflow
    await sendWorkflowEmail(
      BrevoWorkflow.USER_REGISTRATION,
      userEmail,
      subject,
      message,
      {
        attributes: {
          USER_NAME: displayName || username || '',
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error(`Failed to send welcome email to ${userEmail}:`, error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to send welcome email',
    };
  }
}

/**
 * Send password reset email for Better Auth
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  displayName?: string,
  username?: string,
  resetUrl?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data: PasswordResetData = {
      email: userEmail,
      displayName,
      username,
      url: resetUrl || '',
    };

    // Render the password reset template
    const template = EMAIL_TEMPLATES.PASSWORD_RESET;
    const subject = typeof template.subject === 'function'
      ? template.subject(data)
      : template.subject;
    const message = typeof template.html === 'function'
      ? template.html(data)
      : template.html;

    // Send via Brevo workflow
    // TODO: Create PASSWORD_RESET workflow in Brevo if needed
    await sendWorkflowEmail(
      BrevoWorkflow.USER_REGISTRATION,
      userEmail,
      subject,
      message,
      {
        attributes: {
          USER_NAME: displayName || username || '',
          RESET_URL: resetUrl || '',
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error(
      `Failed to send password reset email to ${userEmail}:`,
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email',
    };
  }
}

/**
 * Generic auth email sender - can be used for any template type
 */
export async function sendAuthEmailGeneric(
  templateType: string,
  userEmail: string,
  displayName?: string,
  username?: string,
  actionUrl?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = {
      email: userEmail,
      displayName,
      username,
      url: actionUrl || '',
    };

    // Try to get template
    const template = EMAIL_TEMPLATES[templateType];
    if (!template) {
      throw new Error(`Template type "${templateType}" not found`);
    }

    const subject = typeof template.subject === 'function'
      ? template.subject(data)
      : template.subject;
    const message = typeof template.html === 'function'
      ? template.html(data)
      : template.html;

    // Send via Brevo workflow (using USER_REGISTRATION as generic)
    await sendWorkflowEmail(
      BrevoWorkflow.USER_REGISTRATION,
      userEmail,
      subject,
      message,
      {
        attributes: {
          USER_NAME: displayName || username || '',
          ACTION_URL: actionUrl || '',
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error(
      `Failed to send ${templateType} email to ${userEmail}:`,
      error,
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Failed to send ${templateType} email`,
    };
  }
}
