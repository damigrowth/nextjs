/**
 * AUTHENTICATION VALIDATION SCHEMAS
 * All auth-related validation schemas
 */

import { z } from 'zod';
import { emailSchema, passwordSchema } from './shared';

// =============================================
// ENUM SCHEMAS
// =============================================

export const userRoleSchema = z.enum([
  'user',
  'freelancer',
  'company',
  'admin',
]);
export const authStepSchema = z.enum([
  'EMAIL_VERIFICATION',
  'ONBOARDING',
  'DASHBOARD',
]);

// =============================================
// LOGIN SCHEMAS
// =============================================

// Login with email or username
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(2, 'Το email ή το όνομα χρήστη είναι πολύ μικρό')
    .max(50, 'Το email ή το όνομα χρήστη είναι πολύ μεγάλο'),
  password: z
    .string()
    .min(6, 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
    .max(100, 'Ο κωδικός είναι πολύ μεγάλος'),
});

// Simple email-only login for admin/API use
export const simpleLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ο κωδικός είναι υποχρεωτικός'),
});

// =============================================
// REGISTRATION SCHEMAS
// =============================================

// Base registration schema
export const registerBaseSchema = z.object({
  email: z.string().min(1, 'Το email είναι υποχρεωτικό').email('Μη έγκυρο email'),
  username: z.string().min(4, 'Το όνομα χρήστη είναι πολύ μικρό').max(25),
  password: z.string().min(6, 'Ο κωδικός είναι πολύ μικρός').max(50),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Πρέπει να αποδεχτείτε τους όρους και προϋποθέσεις',
  }),
});

// Professional registration schema
export const registerProfessionalSchema = z.object({
  displayName: z.string().min(3, 'Το όνομα εμφάνισης είναι πολύ μικρό').max(25),
  role: z.number().refine((val) => !isNaN(val) && val > 0, {
    message: 'Επιλέξτε τύπο λογαριασμού',
  }),
});

// Combined registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.default('user'),
  username: z
    .string()
    .min(3, 'Το όνομα χρήστη πρέπει να έχει τουλάχιστον 3 χαρακτήρες')
    .optional(),
  displayName: z.string().min(1, 'Το όνομα εμφάνισης είναι υποχρεωτικό').optional(),
  consent: z.boolean().optional(),
});

// Registration form schema with UI validation
export const registrationFormSchema = z
  .object({
    email: z.string().min(1, 'Το email είναι υποχρεωτικό'),
    password: z
      .string()
      .min(6, 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες')
      .max(100, 'Ο κωδικός είναι πολύ μεγάλος'),
    username: z.string().optional(),
    displayName: z.string().optional(),
    authType: z.number().min(1, 'Επιλέξτε τύπο λογαριασμού').max(2),
    role: z.union([z.literal(2), z.literal(3)]).optional(),
    consent: z
      .array(z.string())
      .min(1, 'Πρέπει να αποδεχτείς τους όρους χρήσης'),
  })
  .refine(
    (data) => {
      // If authType is 2 (professional), role is required
      if (data.authType === 2 && !data.role) {
        return false;
      }
      return true;
    },
    {
      message: 'Πρέπει να επιλέξεις τύπο λογαριασμού',
      path: ['role'],
    },
  );

// =============================================
// PASSWORD SCHEMAS
// =============================================

// Password change schema
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Ο τρέχων κωδικός είναι υποχρεωτικός')
      .min(8, 'Ο τρέχων κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
    newPassword: z
      .string()
      .min(1, 'Ο νέος κωδικός είναι υποχρεωτικός')
      .min(8, 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
    confirmPassword: z
      .string()
      .min(1, 'Η επιβεβαίωση κωδικού είναι υποχρεωτική')
      .min(8, 'Η επιβεβαίωση κωδικού πρέπει να έχει τουλάχιστον 8 χαρακτήρες'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Οι νέοι κωδικοί δεν ταιριάζουν',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Ο νέος κωδικός πρέπει να είναι διαφορετικός από τον τρέχοντα',
    path: ['newPassword'],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Το token είναι υποχρεωτικό'),
  newPassword: passwordSchema,
});

// =============================================
// TOKEN & VERIFICATION SCHEMAS
// =============================================

// Email confirmation schema
export const confirmRegistrationSchema = z.object({
  token: z.string().min(1, 'Το token είναι υποχρεωτικό'),
});

// Account update schema
export const accountUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Το όνομα εμφάνισης πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(50, 'Το όνομα εμφάνισης δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες'),
});

// Onboarding step update
export const updateOnboardingStepSchema = z.object({
  step: authStepSchema,
});

// Delete account schema
export const deleteAccountSchema = z
  .object({
    username: z.string().min(1, 'Το όνομα χρήστη είναι υποχρεωτικό'),
    confirmUsername: z.string().min(1, 'Η επιβεβαίωση ονόματος χρήστη είναι υποχρεωτική'),
  })
  .refine((data) => data.username === data.confirmUsername, {
    message: 'Η επιβεβαίωση ονόματος χρήστη δεν ταιριάζει',
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
export type RegistrationFormInput = z.infer<typeof registrationFormSchema>;
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
