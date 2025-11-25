/**
 * Brevo Workflow Configuration
 *
 * Configuration utilities for Brevo workflows
 * Workflow names are defined in providers/brevo/types.ts BrevoWorkflow enum
 * Each workflow in Brevo should accept {{ params.subject }} and {{ params.message }}
 */

import { BrevoWorkflow, BrevoTransactional } from './providers/brevo/types';
import { EmailTemplateKey } from '@/lib/types/email';

/**
 * Map email template keys to Brevo workflows
 * Add mappings here as you create workflows in Brevo dashboard and add them to the BrevoWorkflow enum
 */
export const TEMPLATE_TO_WORKFLOW: Partial<Record<EmailTemplateKey, BrevoWorkflow>> = {
  // Map your email templates to workflows as you create them in Brevo
  // Example mappings (update based on your actual workflows):

  // These would use existing workflows from the enum
  // 'VERIFICATION': BrevoWorkflow.USER_REGISTRATION,
  // 'WELCOME': BrevoWorkflow.USER_REGISTRATION,
  // 'PASSWORD_RESET': BrevoWorkflow.PASSWORD_RESET, // Add PASSWORD_RESET to enum when you create it
  // 'CONTACT_ADMIN': BrevoWorkflow.CONTACT_ADMIN,   // Add CONTACT_ADMIN to enum when you create it
};

/**
 * Transactional email categories for organization
 */
export const TRANSACTIONAL_CATEGORIES = {
  service: [
    BrevoTransactional.SERVICE_CREATED,
    BrevoTransactional.SERVICE_PUBLISHED,
    BrevoTransactional.SERVICE_APPROVED,
    BrevoTransactional.SERVICE_EXPIRING,
  ],
  admin: [
    BrevoTransactional.NEW_VERIFICATION,
    BrevoTransactional.SERVICE_REPORT,
    BrevoTransactional.PROFILE_REPORT,
  ],
  engagement: [
    BrevoTransactional.NEW_REVIEW,
    BrevoTransactional.NEW_MESSAGE,
  ],
  contact: [
    BrevoTransactional.CONTACT_ADMIN,
  ],
} as const;

/**
 * Workflow automation categories for organization
 */
export const WORKFLOW_CATEGORIES = {
  profile: [
    BrevoWorkflow.NEW_PROFILE,
  ],
  user: [
    BrevoWorkflow.USER_REGISTRATION,
    BrevoWorkflow.FREELANCER_ONBOARDING,
  ],
  engagement: [
    BrevoWorkflow.WEEKLY_DIGEST,
    BrevoWorkflow.MONTHLY_REPORT,
    BrevoWorkflow.INACTIVE_USER,
  ],
} as const;

/**
 * Send a workflow-based or transactional email
 * Renders the template and triggers the appropriate Brevo workflow or transactional email
 */
export async function sendWorkflowEmail(
  workflow: BrevoWorkflow | BrevoTransactional,
  email: string,
  subject: string,
  message: string,
  options?: {
    attributes?: Record<string, any>;
    replyTo?: string;
    text?: string;
    from?: string;
    name?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const { brevoWorkflowService } = await import('./providers/brevo/workflows');

    const result = await brevoWorkflowService.triggerWorkflow(
      workflow,
      email,
      {
        subject,
        message,
        text: options?.text,
        replyTo: options?.replyTo,
        from: options?.from,
        name: options?.name,
        attributes: options?.attributes,
      }
    );

    return {
      success: result.success,
      message: result.message || 'Email sent successfully',
    };
  } catch (error) {
    console.error(`Failed to send workflow email ${workflow}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Helper to send a template-based workflow email
 */
export async function sendTemplateWorkflowEmail(
  templateKey: EmailTemplateKey,
  email: string,
  data: any,
  workflowOverride?: BrevoWorkflow
): Promise<{ success: boolean; message: string }> {
  try {
    // Get the workflow for this template (or use override)
    const workflow = workflowOverride || TEMPLATE_TO_WORKFLOW[templateKey];

    if (!workflow) {
      // Fallback to generic workflow if no specific workflow mapped
      console.warn(`No workflow mapped for template ${templateKey}, using USER_REGISTRATION as fallback`);

      // Get the template and render it
      const { EMAIL_TEMPLATES } = await import('@/constants/email/templates');
      const template = EMAIL_TEMPLATES[templateKey];

      if (!template) {
        throw new Error(`Template ${templateKey} not found`);
      }

      const subject = typeof template.subject === 'function'
        ? template.subject(data)
        : template.subject;
      const message = typeof template.html === 'function'
        ? template.html(data)
        : template.html;

      // Use USER_REGISTRATION as a generic fallback workflow
      await sendWorkflowEmail(
        BrevoWorkflow.USER_REGISTRATION,
        email,
        subject,
        message
      );

      return { success: true, message: 'Email sent via fallback workflow' };
    }

    // Get the template
    const { EMAIL_TEMPLATES } = await import('@/constants/email/templates');
    const template = EMAIL_TEMPLATES[templateKey];

    if (!template) {
      throw new Error(`Template ${templateKey} not found`);
    }

    // Render the template
    const subject = typeof template.subject === 'function'
      ? template.subject(data)
      : template.subject;

    const message = typeof template.html === 'function'
      ? template.html(data)
      : template.html;

    // Send via workflow
    return await sendWorkflowEmail(
      workflow,
      email,
      subject,
      message,
      {
        attributes: data.attributes,
        replyTo: template.replyTo || undefined,
      }
    );
  } catch (error) {
    console.error(`Failed to send template workflow email:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}