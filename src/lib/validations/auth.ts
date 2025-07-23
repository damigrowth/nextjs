/**
 * AUTHENTICATION VALIDATION SCHEMAS
 * All auth-related validation schemas
 */

import { z } from 'zod';
import { emailSchema, passwordSchema } from './shared';

// =============================================
// ENUM SCHEMAS
// =============================================

export const userRoleSchema = z.enum(['user', 'freelancer', 'company', 'admin']);
export const authStepSchema = z.enum(['EMAIL_VERIFICATION', 'ONBOARDING', 'DASHBOARD']);

// =============================================
// LOGIN SCHEMAS
// =============================================

// Login with email or username
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(2, 'Email or username is too short')
    .max(50, 'Email or username is too long'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

// Simple email-only login for admin/API use
export const simpleLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// =============================================
// REGISTRATION SCHEMAS
// =============================================

// Base registration schema
export const registerBaseSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  username: z.string().min(4, 'Username is too short').max(25),
  password: z.string().min(6, 'Password is too short').max(50),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Professional registration schema
export const registerProfessionalSchema = z.object({
  displayName: z
    .string()
    .min(3, 'Display name is too short')
    .max(25),
  role: z.number().refine((val) => !isNaN(val) && val > 0, {
    message: 'Select account type',
  }),
});

// Combined registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.default('user'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  displayName: z.string().min(1, 'Display name is required').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  consent: z.boolean().optional(),
});

// =============================================
// PASSWORD SCHEMAS
// =============================================

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required')
      .min(8, 'Current password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(1, 'Password confirmation is required')
      .min(8, 'Password confirmation must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: passwordSchema
});

// =============================================
// TOKEN & VERIFICATION SCHEMAS
// =============================================

// Email confirmation schema
export const confirmRegistrationSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

// Account update schema
export const accountUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters'),
});

// Onboarding step update
export const updateOnboardingStepSchema = z.object({
  step: authStepSchema,
});

// Delete account schema
export const deleteAccountSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required'),
  confirmUsername: z
    .string()
    .min(1, 'Username confirmation is required'),
}).refine((data) => data.username === data.confirmUsername, {
  message: 'Username confirmation does not match',
  path: ['confirmUsername'],
});

// =============================================
// SESSION SCHEMAS (Better Auth)
// =============================================

export const sessionSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
  userId: z.string().cuid('Invalid ID format'),
  expiresAt: z.date(),
  token: z.string().min(1),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const accountSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
  accountId: z.string().min(1),
  providerId: z.string().min(1),
  userId: z.string().cuid('Invalid ID format'),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  accessTokenExpiresAt: z.date().optional(),
  refreshTokenExpiresAt: z.date().optional(),
  scope: z.string().optional(),
  password: z.string().optional(),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SimpleLoginInput = z.infer<typeof simpleLoginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// =============================================
// VALIDATION HELPERS
// =============================================

/**
 * Validate if a role can create profiles
 */
export function canCreateProfile(role: string): boolean {
  return role === 'freelancer' || role === 'company';
}

/**
 * Validate if a role is professional
 */
export function isProfessionalRole(role: string): boolean {
  return role === 'freelancer' || role === 'company';
}

/**
 * Validate if a role has admin privileges
 */
export function isAdminRole(role: string): boolean {
  return role === 'admin';
}

/**
 * Get required fields for auth step
 */
export function getRequiredFieldsForStep(step: string, role: string): string[] {
  const baseFields = ['email', 'emailVerified'];

  switch (step) {
    case 'EMAIL_VERIFICATION':
      return baseFields;
    case 'ONBOARDING':
      if (isProfessionalRole(role)) {
        return [...baseFields, 'username', 'displayName'];
      }
      return baseFields;
    case 'DASHBOARD':
      return [...baseFields, 'confirmed'];
    default:
      return baseFields;
  }
}