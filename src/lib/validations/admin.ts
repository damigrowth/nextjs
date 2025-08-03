/**
 * ADMIN VALIDATION SCHEMAS
 *
 * Validation schemas for admin operations using Better Auth
 * Aligned with existing validation patterns and Better Auth API
 */

import { z } from 'zod';
import {
  userRoleSchema,
  authStepSchema,
  emailSchema,
  passwordSchema,
} from '../validations';

// =============================================
// ADMIN USER MANAGEMENT SCHEMAS
// =============================================

export const adminListUsersSchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(['email', 'name']).optional().default('email'),
  searchOperator: z
    .enum(['contains', 'starts_with', 'ends_with'])
    .optional()
    .default('contains'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z.string().optional().default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  filterField: z.string().optional(),
  filterOperator: z
    .enum(['eq', 'contains', 'starts_with', 'ends_with'])
    .optional(),
  filterValue: z.string().optional(),
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.default('user'), // This will be handled after Better Auth user creation
  displayName: z.string().min(1).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional(),
  emailVerified: z.boolean().optional().default(true), // Admin-created users are pre-verified
  confirmed: z.boolean().optional().default(true), // Admin-created users are pre-confirmed
});

export const adminUpdateUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  displayName: z.string().min(1).optional(),
  username: z.string().min(3).optional(),
  role: userRoleSchema.optional(), // Add role field to update schema
  confirmed: z.boolean().optional(),
  blocked: z.boolean().optional(),
  step: authStepSchema.optional(),
  emailVerified: z.boolean().optional(),
});

export const adminSetRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: userRoleSchema, // Our full role schema, will be handled with fallback
});

export const adminSetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  newPassword: passwordSchema,
});

export const adminBanUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  banReason: z.string().max(500, 'Ban reason too long').optional(),
  banExpiresIn: z.coerce.number().int().min(1).optional(), // in seconds
});

export const adminUnbanUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const adminRemoveUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const adminImpersonateUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// =============================================
// ADMIN SESSION MANAGEMENT SCHEMAS
// =============================================

export const adminListUserSessionsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const adminRevokeSessionSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
});

export const adminRevokeUserSessionsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// =============================================
// ADMIN BULK OPERATIONS SCHEMAS
// =============================================

export const adminBulkActionSchema = z.object({
  userIds: z
    .array(z.string().min(1))
    .min(1, 'At least one user ID is required'),
  action: z.enum(['ban', 'unban', 'delete', 'set_role', 'revoke_sessions']),
  params: z.record(z.string(), z.any()).optional(), // Additional parameters for the action
});

// =============================================
// ADMIN STATISTICS SCHEMAS
// =============================================

export const adminUserStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// =============================================
// FORM VALIDATION SCHEMAS (for React Hook Form)
// =============================================

export const createUserFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: userRoleSchema,
    sendWelcomeEmail: z.boolean(),
    autoVerify: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const editUserFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  email: emailSchema.optional(),
  displayName: z.string().min(1).optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional(),
  role: userRoleSchema.optional(),
  confirmed: z.boolean().optional(),
  blocked: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

export const banUserFormSchema = z
  .object({
    userId: z.string().min(1),
    banReason: z.string().min(1, 'Please provide a ban reason').max(500),
    banDuration: z.number().int().min(1).max(365).optional(), // in days
    isPermanent: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.isPermanent && !data.banDuration) {
        return false;
      }
      return true;
    },
    {
      message: 'Please specify ban duration or mark as permanent',
      path: ['banDuration'],
    },
  );

export const setPasswordFormSchema = z
  .object({
    userId: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm the new password'),
    sendNotification: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const revokeSessionSchema = z.object({
  sessionToken: z.string().min(1, 'Session token is required'),
});

export const revokeUserSessionsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// =============================================
// ADMIN API KEY SCHEMAS (extracted from admin actions)
// =============================================

export const validateApiKeySchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

export const createAdminApiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  expiresIn: z.number().min(1).max(365).optional().default(365), // days
  metadata: z
    .object({
      purpose: z.string().optional(),
      owner: z.string().optional(),
    })
    .optional(),
});

export const updateAdminApiKeySchema = z.object({
  name: z.string().optional(),
  enabled: z.boolean().optional(),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type AdminListUsersInput = z.infer<typeof adminListUsersSchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminSetRoleInput = z.infer<typeof adminSetRoleSchema>;
export type AdminSetPasswordInput = z.infer<typeof adminSetPasswordSchema>;
export type AdminBanUserInput = z.infer<typeof adminBanUserSchema>;
export type AdminUnbanUserInput = z.infer<typeof adminUnbanUserSchema>;
export type AdminRemoveUserInput = z.infer<typeof adminRemoveUserSchema>;
export type AdminImpersonateUserInput = z.infer<
  typeof adminImpersonateUserSchema
>;

export type AdminListUserSessionsInput = z.infer<
  typeof adminListUserSessionsSchema
>;
export type AdminRevokeSessionInput = z.infer<typeof adminRevokeSessionSchema>;
export type AdminRevokeUserSessionsInput = z.infer<
  typeof adminRevokeUserSessionsSchema
>;

export type AdminBulkActionInput = z.infer<typeof adminBulkActionSchema>;
export type AdminUserStatsInput = z.infer<typeof adminUserStatsSchema>;

// Form types
export type CreateUserFormInput = z.infer<typeof createUserFormSchema>;
export type EditUserFormInput = z.infer<typeof editUserFormSchema>;
export type BanUserFormInput = z.infer<typeof banUserFormSchema>;
export type SetPasswordFormInput = z.infer<typeof setPasswordFormSchema>;

// =============================================
// VALIDATION HELPERS
// =============================================

/**
 * Check if a role can be assigned by the current admin
 */
export function canAssignRole(
  currentAdminRole: string,
  targetRole: string,
): boolean {
  // Only admins can assign admin role
  if (targetRole === 'admin') {
    return currentAdminRole === 'admin';
  }

  // Admins can assign any role
  return currentAdminRole === 'admin';
}

/**
 * Get allowed roles for user creation/editing
 */
export function getAllowedRoles(currentAdminRole: string): string[] {
  if (currentAdminRole === 'admin') {
    return ['user', 'freelancer', 'company', 'admin'];
  }

  return ['user', 'freelancer', 'company'];
}

/**
 * Validate ban duration
 */
export function validateBanDuration(durationInDays: number): boolean {
  return durationInDays > 0 && durationInDays <= 3650; // Max 10 years
}

/**
 * Convert ban duration from days to seconds (for Better Auth)
 */
export function banDurationToSeconds(days: number): number {
  return days * 24 * 60 * 60;
}
