import { VERIFICATION } from './verification';
import { WELCOME } from './welcome';
import { PASSWORD_RESET } from './password-reset';
import { CONTACT_ADMIN, CONTACT_CONFIRMATION } from './contact';
import { EmailTemplate, EmailTemplateKey } from '@/lib/types/email';

export const EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplate> = {
  VERIFICATION,
  WELCOME,
  PASSWORD_RESET,
  CONTACT_ADMIN,
  CONTACT_CONFIRMATION,
};