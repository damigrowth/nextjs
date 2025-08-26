// Email template types for better type safety

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

// You can add more template data types here as you create them
export interface FormEmailData {
  name: string;
  email: string;
  message: string;
  [key: string]: any; // Allow additional fields for different forms
}

// Example for future templates
export interface NewsletterEmailData {
  name: string;
  email: string;
  unsubscribeUrl: string;
}

export interface ServiceRequestEmailData {
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  description: string;
  budget?: string;
  timeline?: string;
}