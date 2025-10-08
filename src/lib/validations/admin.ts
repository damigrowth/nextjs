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
// USER EDITING FORM SCHEMAS
// =============================================

export const updateUserBasicInfoSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  email: emailSchema.optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  displayName: z.string().min(1).max(100).optional().or(z.literal('')),
  firstName: z.string().min(1).max(100).optional().or(z.literal('')),
  lastName: z.string().min(1).max(100).optional().or(z.literal('')),
});

export const updateUserStatusSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: userRoleSchema.optional(),
  type: z.enum(['user', 'pro']).optional(),
  step: authStepSchema.optional(),
  emailVerified: z.boolean().optional(),
  confirmed: z.boolean().optional(),
  blocked: z.boolean().optional(),
});

export const updateUserImageSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  image: z.string().url().nullable(),
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

// =============================================
// ADMIN PROFILE MANAGEMENT SCHEMAS
// =============================================

export const adminListProfilesSchema = z.object({
  searchQuery: z.string().optional(),
  type: z.enum(['all', 'freelancer', 'company']).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  published: z.enum(['all', 'published', 'draft']).optional(),
  verified: z.enum(['all', 'verified', 'unverified']).optional(),
  featured: z.enum(['all', 'featured', 'not-featured']).optional(),
  status: z.enum(['all', 'featured', 'top']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z
    .enum(['createdAt', 'rating', 'reviewCount', 'updatedAt'])
    .optional()
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const adminUpdateProfileSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  // Basic info
  displayName: z.string().min(1).max(100).optional(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(200).optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),

  // Professional
  type: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  skills: z.array(z.string()).optional(),
  speciality: z.string().optional(),
  rate: z.number().int().min(0).optional(),
  experience: z.number().int().min(0).max(100).optional(),
  size: z.string().optional(),
  commencement: z.string().optional(),
  budget: z.string().optional(),
  industries: z.array(z.string()).optional(),
  terms: z.string().optional(),

  // Contact
  contactMethods: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  settlementMethods: z.array(z.string()).optional(),
  viber: z.string().optional(),
  whatsapp: z.string().optional(),

  // Settings
  visibility: z.record(z.string(), z.boolean()).optional(),
  socials: z.record(z.string(), z.string()).optional(),

  // Status flags (admin only)
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  top: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const adminToggleProfileSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
});

export const adminDeleteProfileSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
});

export const adminUpdateVerificationSchema = z.object({
  profileId: z.string().min(1, 'Profile ID is required'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  notes: z.string().max(1000).optional(),
});

export const editProfileFormSchema = z.object({
  // Basic tab
  displayName: z.string().min(1, 'Display name is required').max(100),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  tagline: z.string().max(200).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),

  // Professional tab
  type: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  skills: z.array(z.string()).optional(),
  speciality: z.string().optional(),
  rate: z.coerce.number().int().min(0).optional(),
  experience: z.coerce.number().int().min(0).max(100).optional(),

  // Contact tab
  phone: z.string().optional(),
  viber: z.string().optional(),
  whatsapp: z.string().optional(),
  contactMethods: z.array(z.string()).optional(),

  // Status flags
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
});

// =============================================
// PROFILE TYPE EXPORTS
// =============================================

export type AdminListProfilesInput = z.infer<typeof adminListProfilesSchema>;
export type AdminUpdateProfileInput = z.infer<typeof adminUpdateProfileSchema>;
export type AdminToggleProfileInput = z.infer<typeof adminToggleProfileSchema>;
export type AdminDeleteProfileInput = z.infer<typeof adminDeleteProfileSchema>;
export type AdminUpdateVerificationInput = z.infer<
  typeof adminUpdateVerificationSchema
>;
export type EditProfileFormInput = z.infer<typeof editProfileFormSchema>;

// =============================================
// ADMIN SERVICE MANAGEMENT SCHEMAS
// =============================================

export const adminListServicesSchema = z.object({
  searchQuery: z.string().optional(),
  status: z.enum(['all', 'draft', 'pending', 'published', 'rejected', 'approved', 'inactive']).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  subdivision: z.string().optional(),
  featured: z.enum(['all', 'featured', 'not-featured']).optional(),
  type: z.enum(['all', 'presence', 'onbase', 'onsite', 'online', 'oneoff', 'subscription']).optional(),
  pricing: z.enum(['all', 'fixed', 'not-fixed']).optional(),
  subscriptionType: z.enum(['all', 'month', 'year', 'per_case', 'per_hour', 'per_session']).optional(),
  profileId: z.string().optional(), // Filter by profile
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z
    .enum(['createdAt', 'rating', 'reviewCount', 'updatedAt', 'price'])
    .optional()
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const adminUpdateServiceSchema = z.object({
  serviceId: z.coerce.number().int().min(1, 'Service ID is required'),
  // Basic info
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),

  // Taxonomies
  category: z.string().optional(),
  subcategory: z.string().optional(),
  subdivision: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Pricing
  fixed: z.boolean().optional(),
  price: z.number().int().min(0).optional(),
  type: z.record(z.string(), z.boolean()).optional(), // online, presence, onsite, etc.
  subscriptionType: z.enum(['month', 'year', 'per_case', 'per_hour', 'per_session']).optional().nullable(),
  duration: z.number().int().min(0).optional(),

  // Features
  addons: z.array(z.record(z.string(), z.any())).optional(),
  faq: z.array(z.record(z.string(), z.any())).optional(),

  // Media
  media: z.record(z.string(), z.any()).optional().nullable(),

  // Status flags (admin only)
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'approved', 'inactive']).optional(),
  featured: z.boolean().optional(),
});

export const adminToggleServiceSchema = z.object({
  serviceId: z.coerce.number().int().min(1, 'Service ID is required'),
});

export const adminUpdateServiceStatusSchema = z.object({
  serviceId: z.coerce.number().int().min(1, 'Service ID is required'),
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'approved', 'inactive']),
  rejectionReason: z.string().max(500).optional(),
});

export const adminDeleteServiceSchema = z.object({
  serviceId: z.coerce.number().int().min(1, 'Service ID is required'),
});

export const editServiceFormSchema = z.object({
  // Basic tab
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),

  // Category tab
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  subdivision: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Pricing tab
  fixed: z.boolean(),
  price: z.coerce.number().int().min(0),
  duration: z.coerce.number().int().min(0).optional(),

  // Status flags
  status: z.enum(['draft', 'pending', 'published', 'rejected', 'approved', 'inactive']).optional(),
  featured: z.boolean().optional(),
});

// =============================================
// SERVICE TYPE EXPORTS
// =============================================

export type AdminListServicesInput = z.infer<typeof adminListServicesSchema>;
export type AdminUpdateServiceInput = z.infer<typeof adminUpdateServiceSchema>;
export type AdminToggleServiceInput = z.infer<typeof adminToggleServiceSchema>;
export type AdminUpdateServiceStatusInput = z.infer<typeof adminUpdateServiceStatusSchema>;
export type AdminDeleteServiceInput = z.infer<typeof adminDeleteServiceSchema>;
export type EditServiceFormInput = z.infer<typeof editServiceFormSchema>;

// =============================================
// ADMIN VERIFICATION MANAGEMENT SCHEMAS
// =============================================

export const adminListVerificationsSchema = z.object({
  searchQuery: z.string().optional(), // Search AFM or business name
  status: z.enum(['all', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'status'])
    .optional()
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const adminUpdateVerificationStatusSchema = z.object({
  verificationId: z.string().min(1, 'Verification ID is required'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  notes: z.string().max(1000).optional(),
});

export const adminDeleteVerificationSchema = z.object({
  verificationId: z.string().min(1, 'Verification ID is required'),
});

// Form schemas for dialogs
export const approveVerificationFormSchema = z.object({
  verificationId: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

export const rejectVerificationFormSchema = z.object({
  verificationId: z.string().min(1),
  reason: z
    .string()
    .min(1, 'Rejection reason is required')
    .max(1000, 'Reason is too long'),
});

// =============================================
// VERIFICATION TYPE EXPORTS
// =============================================

export type AdminListVerificationsInput = z.infer<
  typeof adminListVerificationsSchema
>;
export type AdminUpdateVerificationStatusInput = z.infer<
  typeof adminUpdateVerificationStatusSchema
>;
export type AdminDeleteVerificationInput = z.infer<
  typeof adminDeleteVerificationSchema
>;
export type ApproveVerificationFormInput = z.infer<
  typeof approveVerificationFormSchema
>;
export type RejectVerificationFormInput = z.infer<
  typeof rejectVerificationFormSchema
>;
