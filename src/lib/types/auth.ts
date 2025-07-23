/**
 * AUTHENTICATION TYPE DEFINITIONS
 * All authentication and authorization related types
 */

/**
 * User type matching Prisma User model
 */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;

  // Auth flow fields (from User model)
  role: 'user' | 'freelancer' | 'company' | 'admin';
  step: 'EMAIL_VERIFICATION' | 'ONBOARDING' | 'DASHBOARD';
  
  // User status fields
  confirmed: boolean;
  blocked: boolean;
  banned: boolean;
  banReason?: string;
  banExpires?: Date;

  // Auth fields kept in User for auth purposes
  username?: string;
  displayName?: string;
}

/**
 * Session type matching Prisma Session model
 */
export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  user: AuthUser;
}

/**
 * Type definitions
 */
export type UserRole = 'user' | 'freelancer' | 'company' | 'admin';
export type AuthStep = 'EMAIL_VERIFICATION' | 'ONBOARDING' | 'DASHBOARD';

/**
 * Auth state interface
 */
export interface AuthState {
  user?: AuthUser;
  session?: AuthSession;
  isLoading: boolean;
  isAuthenticated: boolean;

  // User role helpers
  isUser: boolean;
  isFreelancer: boolean;
  isCompany: boolean;
  isAdmin: boolean;
  isProfessional: boolean; // freelancer or company
  hasAccess: boolean; // freelancer, company, or admin

  // Status helpers
  isConfirmed: boolean;
  needsEmailVerification: boolean;
  needsOnboarding: boolean;
  canAccessDashboard: boolean;
}

/**
 * Better Auth client response types
 */
export interface SignUpResponse {
  data?: {
    user: AuthUser;
    session: AuthSession;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface SignInResponse {
  data?: {
    user: AuthUser;
    session: AuthSession;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Email verification types
 */
export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

/**
 * Password reset types
 */
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * Profile completion types (for OAuth users)
 */
export interface ProfileCompletionData {
  username: string;
  displayName: string;
  role: UserRole;
}

/**
 * Form validation types
 */
export interface AuthFormErrors {
  [key: string]: string | undefined;
}

export interface AuthFormState {
  isLoading: boolean;
  errors: AuthFormErrors;
  success?: string;
}

/**
 * Route protection types
 */
export interface RouteGuard {
  requireAuth: boolean;
  requireRoles?: UserRole[];
  requireStep?: AuthStep;
  redirectTo?: string;
}

/**
 * User update types
 */
export interface UserUpdateData {
  name?: string;
  username?: string;
  displayName?: string;
  role?: UserRole;
  step?: AuthStep;
  confirmed?: boolean;
  blocked?: boolean;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
}

// OAuth specific types
export interface OAuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
}

export interface OAuthAccount {
  provider: string;
  providerAccountId: string;
  type: 'oauth';
  userId: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

// Authentication result types
export type AuthResult<T = any> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

export interface LoginResult {
  user: AuthUser;
  session: AuthSession;
  requiresOnboarding?: boolean;
  requiresEmailVerification?: boolean;
}

export interface RegisterResult {
  user: AuthUser;
  session?: AuthSession;
  emailVerificationRequired: boolean;
}

// Permission types
export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

export type PermissionCheck = (
  user: AuthUser | null,
  action: string,
  resource: string,
  context?: Record<string, any>
) => boolean;