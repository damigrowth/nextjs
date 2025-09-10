// Email template types for better type safety

/**
 * Minimal user type for email sending
 * Contains only the fields needed by email templates
 */
export type EmailUser = {
  email: string;
};

/**
 * Email sending result
 */
export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

/**
 * Email options for sending
 */
export interface EmailOptions {
  to: string | string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  from: string;
  replyTo?: string | null;
  subject: string | ((data: any) => string);
  html: string | ((data: any) => string);
  text?: string | ((data: any) => string);
}

// Contact form data types
export interface ContactEmailData {
  name: string;
  email: string;
  message: string;
  subject?: string;
  contactId?: string;
}

// Template keys for type safety
export type EmailTemplateKey =
  | 'VERIFICATION'
  | 'WELCOME'
  | 'PASSWORD_RESET'
  | 'CONTACT_ADMIN'
  | 'CONTACT_CONFIRMATION';
