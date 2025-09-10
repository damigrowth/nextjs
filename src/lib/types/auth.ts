/**
 * AUTHENTICATION TYPE DEFINITIONS
 * All authentication and authorization related types
 */

// Import types from Better Auth for type inference
import type { auth } from '@/lib/auth';

/**
 * Profile JSON field types for better type safety
 */
export interface ProfileVisibility {
  email: boolean;
  phone: boolean;
  address: boolean;
}

/**
 * User type inferred from Better Auth server instance
 */
export type AuthUser = typeof auth.$Infer.Session.user;

/**
 * Session type inferred from Better Auth server instance
 */
export type AuthSession = typeof auth.$Infer.Session;

/**
 * Type definitions
 */
export type UserRole = 'user' | 'freelancer' | 'company' | 'admin';
export type AuthStep =
  | 'EMAIL_VERIFICATION'
  | 'OAUTH_SETUP'
  | 'ONBOARDING'
  | 'DASHBOARD';
export type AuthProvider = 'email' | 'google' | 'github'; // Add more providers as needed

// Auth form UI types
export type AuthType = '' | 'user' | 'pro'; // '' = no selection, 'user' = user, 'pro' = professional
export type ProRole = 'freelancer' | 'company' | null; // freelancer, company, null = not selected
export type ConsentType = boolean | string[];

/**
 * Profile with optional relations for auth context
 */
export type ProfileWithRelations = import('@prisma/client').Profile & {
  services?: import('@prisma/client').Service[];
  reviews?: import('@prisma/client').Review[];
  chatMemberships?: import('@prisma/client').ChatMember[];
  portfolio?: PrismaJson.CloudinaryResource[];
};
