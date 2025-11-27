/**
 * Brevo API TypeScript Types
 *
 * Type definitions for Brevo email service integration
 */

export interface BrevoConfig {
  apiKey: string;
  defaultSender: {
    name: string;
    email: string;
  };
  environment?: 'production' | 'development' | 'test';
}

export interface BrevoSender {
  name?: string;
  email: string;
}

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoAttachment {
  url?: string;
  content?: string;
  name: string;
}

export interface BrevoEmailParams {
  to: BrevoRecipient[];
  sender: BrevoSender;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  attachment?: BrevoAttachment[];
  replyTo?: BrevoSender;
  tags?: string[];
  messageVersions?: any[];
  scheduledAt?: string;
}

export interface BrevoEmailResponse {
  messageId: string;
  messageIds?: string[];
}

export interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  emailBlacklisted?: boolean;
  smsBlacklisted?: boolean;
  listIds?: number[];
  updateEnabled?: boolean;
  smtpBlacklistSender?: string[];
}

export interface BrevoWorkflowTrigger {
  workflowId: number;
  email: string;
  attributes?: Record<string, any>;
}

export interface BrevoWorkflowResponse {
  success: boolean;
  message?: string;
}

export interface BrevoEmailEvent {
  event: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam' | 'unsubscribed';
  email: string;
  messageId: string;
  timestamp: number;
  link?: string;
  reason?: string;
}

export interface BrevoTemplate {
  id: number;
  name: string;
  subject: string;
  isActive: boolean;
  testSent: boolean;
  sender: BrevoSender;
  replyTo?: string;
  toField?: string;
  htmlContent: string;
  tag?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface BrevoList {
  id: number;
  name: string;
  totalBlacklisted: number;
  totalSubscribers: number;
  folderId?: number;
  createdAt: string;
  uniqueSubscribers?: number;
}

export interface BrevoAutomation {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  triggerType: 'event' | 'date' | 'anniversary' | 'recurring';
  createdAt: string;
  modifiedAt: string;
}

// Error types
export interface BrevoError {
  code: string;
  message: string;
  details?: any;
}

// Webhook types for receiving events
export interface BrevoWebhookPayload {
  event: string;
  email: string;
  id: number;
  'message-id': string;
  ts: number;
  ts_event: number;
  subject?: string;
  tag?: string;
  link?: string;
  reason?: string;
}

// Contact attributes specific to Doulitsa
export interface DoulitsaContactAttributes {
  DISPLAY_NAME?: string;
  USERNAME?: string;
  USER_TYPE?: 'user' | 'pro'; // Matches user.type: registration flow type
  USER_ROLE?: 'user' | 'freelancer' | 'company' | 'admin'; // Matches user.role: permission role
  ACCOUNT_STATUS?: 'active' | 'inactive' | 'suspended';
  REGISTRATION_DATE?: string;
  LAST_LOGIN?: string;
  SERVICES_COUNT?: number;
  REVIEWS_COUNT?: number;
  RATING_AVERAGE?: number;
  PREFERRED_LANGUAGE?: 'el' | 'en';
  LOCATION?: string;
  CATEGORIES?: string[];
  IS_VERIFIED?: boolean;
  IS_PRO?: boolean;
  SUBSCRIPTION_PLAN?: string;
}

// Transactional email types (one-time direct sends)
export enum BrevoTransactional {
  SERVICE_CREATED = 'service_created',
  SERVICE_PUBLISHED = 'service_published',
  CONTACT_ADMIN = 'contact_admin',
  NEW_VERIFICATION = 'new_verification',
  SERVICE_REPORT = 'service_report',
  PROFILE_REPORT = 'profile_report',
  SUPPORT_FEEDBACK = 'support_feedback',
  NEW_REVIEW = 'new_review',
  SERVICE_APPROVED = 'service_approved',
  SERVICE_EXPIRING = 'service_expiring',
  NEW_MESSAGE = 'new_message',
  UNREAD_MESSAGES = 'unread_messages',
}

// Workflow automation types (sequences with list management)
export enum BrevoWorkflow {
  NEW_PROFILE = 'new_profile',
  USER_REGISTRATION = 'user_registration',
  FREELANCER_ONBOARDING = 'freelancer_onboarding',
  INACTIVE_USER = 'inactive_user_reengagement',
  WEEKLY_DIGEST = 'weekly_digest',
  MONTHLY_REPORT = 'monthly_report',
}

// Template IDs mapping for type safety
export enum BrevoTemplateId {
  VERIFICATION = 1,
  WELCOME = 2,
  PASSWORD_RESET = 3,
  CONTACT_ADMIN = 4,
  CONTACT_CONFIRMATION = 5,
  SERVICE_APPROVED = 6,
  SERVICE_EXPIRING = 7,
  NEW_REVIEW_NOTIFICATION = 8,
  NEW_MESSAGE_NOTIFICATION = 9,
  WEEKLY_DIGEST = 10,
  MONTHLY_REPORT = 11,
}

// List IDs for user journey tracking
export enum BrevoListId {
  USERS = parseInt(process.env.BREVO_LIST_USERS || '6', 10),
  EMPTYPROFILE = parseInt(process.env.BREVO_LIST_EMPTYPROFILE || '6', 10),
  NOSERVICES = parseInt(process.env.BREVO_LIST_NOSERVICES || '6', 10),
  PROS = parseInt(process.env.BREVO_LIST_PROS || '6', 10),
}

// List management types
export interface BrevoAddToListRequest {
  email: string;
  listIds?: number[];
  attributes?: DoulitsaContactAttributes;
  updateEnabled?: boolean;
}

export interface BrevoRemoveFromListRequest {
  emails: string[];
}

export interface BrevoListOperationResponse {
  success: boolean;
  message?: string;
}