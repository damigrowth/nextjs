import { UserRole, AuthStep, AuthUser } from '@/types/auth';

/**
 * Get user role label
 */
export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case 'user':
      return 'Simple User';
    case 'freelancer':
      return 'Freelancer';
    case 'company':
      return 'Company';
    case 'admin':
      return 'Administrator';
    default:
      return 'Unknown';
  }
}

/**
 * Get user role description
 */
export function getUserRoleDescription(role: UserRole): string {
  switch (role) {
    case 'user':
      return 'Browse and hire professionals';
    case 'freelancer':
      return 'Offer your services independently';
    case 'company':
      return 'Represent your business';
    case 'admin':
      return 'Manage the platform';
    default:
      return '';
  }
}

/**
 * Check if user role is professional
 */
export function isProfessionalUser(role: UserRole): boolean {
  return role === 'freelancer' || role === 'company';
}

/**
 * Check if user has admin privileges
 */
export function isAdminUser(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Get next step in auth flow
 */
export function getNextAuthStep(
  currentStep: AuthStep,
  userRole: UserRole,
): AuthStep {
  switch (currentStep) {
    case 'EMAIL_VERIFICATION':
      return isProfessionalUser(userRole) ? 'ONBOARDING' : 'DASHBOARD';
    case 'ONBOARDING':
      return 'DASHBOARD';
    default:
      return 'DASHBOARD';
  }
}

/**
 * Check if user can access dashboard
 */
export function canAccessDashboard(user: AuthUser | null): boolean {
  return !!(
    user &&
    user.step === 'DASHBOARD' &&
    user.confirmed &&
    !user.blocked &&
    !user.banned &&
    user.emailVerified
  );
}

/**
 * Check if user needs onboarding
 */
export function needsOnboarding(user: AuthUser | null): boolean {
  return !!(
    user &&
    isProfessionalUser(user.role) &&
    user.step === 'ONBOARDING' &&
    user.emailVerified &&
    user.confirmed &&
    !user.blocked &&
    !user.banned
  );
}

/**
 * Check if user needs email verification
 */
export function needsEmailVerification(user: AuthUser | null): boolean {
  return !!(user && user.step === 'EMAIL_VERIFICATION' && !user.emailVerified);
}

/**
 * Check if user is blocked
 */
export function isUserBlocked(user: AuthUser | null): boolean {
  return !!(user && (user.blocked || user.banned));
}

/**
 * Check if user ban is expired
 */
export function isBanExpired(user: AuthUser | null): boolean {
  if (!user || !user.banned || !user.banExpires) return false;
  return new Date() > new Date(user.banExpires);
}

/**
 * Get redirect URL based on user state
 */
export function getRedirectUrl(user: AuthUser | null): string {
  if (!user) return '/auth/signin';

  // Check for blocks and bans
  if (user.blocked) return '/auth/blocked';
  if (user.banned && !isBanExpired(user)) return '/auth/blocked';

  // Check auth flow
  if (needsEmailVerification(user)) return '/auth/verify-email';
  if (needsOnboarding(user)) return '/onboarding';
  if (canAccessDashboard(user)) return '/dashboard';

  // Default fallback
  return '/';
}

/**
 * Check if user can access specific route
 */
export function canAccessRoute(
  user: AuthUser | null,
  requiredRoles?: UserRole[],
  requiredStep?: AuthStep,
): boolean {
  if (!user) return false;

  // Check if user is blocked or banned
  if (isUserBlocked(user)) return false;

  // Check role requirements
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return false;
  }

  // Check step requirements
  if (requiredStep && user.step !== requiredStep) {
    // Allow access to dashboard if user completed onboarding
    if (requiredStep === 'DASHBOARD' && user.step === 'DASHBOARD') {
      return true;
    }
    return false;
  }

  return true;
}

/**
 * Get required fields for auth step
 */
export function getRequiredFieldsForStep(
  step: AuthStep,
  role: UserRole,
): string[] {
  const baseFields = ['email', 'emailVerified'];

  switch (step) {
    case 'EMAIL_VERIFICATION':
      return baseFields;
    case 'ONBOARDING':
      if (isProfessionalUser(role)) {
        return [...baseFields, 'username', 'displayName'];
      }
      return baseFields;
    case 'DASHBOARD':
      return [...baseFields, 'confirmed'];
    default:
      return baseFields;
  }
}

/**
 * Check if user has completed required fields for step
 */
export function hasCompletedRequiredFields(
  user: AuthUser | null,
  step: AuthStep,
): boolean {
  if (!user) return false;

  const requiredFields = getRequiredFieldsForStep(step, user.role);

  return requiredFields.every((field) => {
    const value = user[field as keyof AuthUser];
    return (
      value !== null && value !== undefined && value !== false && value !== ''
    );
  });
}

/**
 * Get user progress percentage
 */
export function getUserProgress(user: AuthUser | null): number {
  if (!user) return 0;

  let progress = 0;
  const totalSteps = isProfessionalUser(user.role) ? 3 : 2; // Email verification + onboarding (if professional) + dashboard

  if (user.emailVerified) progress += 1;
  if (user.role === 'user' || (user.username && user.displayName)) progress += 1;
  if (user.step === 'DASHBOARD') progress += 1;

  return Math.round((progress / totalSteps) * 100);
}

/**
 * Format user display name
 */
export function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest';

  if (user.displayName) return user.displayName;
  if (user.name) return user.name;
  if (user.username) return user.username;
  return user.email?.split('@')[0] || 'User';
}

/**
 * Get user avatar URL or initials
 */
export function getUserAvatar(user: AuthUser | null): { url?: string; initials: string } {
  const displayName = getDisplayName(user);
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return {
    url: user?.image || undefined,
    initials: initials || 'U',
  };
}

/**
 * Check if user email is verified
 */
export function isEmailVerified(user: AuthUser | null): boolean {
  return !!(user && user.emailVerified);
}

/**
 * Check if user is confirmed
 */
export function isUserConfirmed(user: AuthUser | null): boolean {
  return !!(user && user.confirmed);
}

/**
 * Get user role permissions
 */
export function getUserPermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin':
      return ['manage_users', 'manage_profiles', 'manage_services', 'manage_system'];
    case 'company':
      return ['create_profile', 'post_jobs', 'hire_freelancers', 'manage_team'];
    case 'freelancer':
      return ['create_profile', 'offer_services', 'apply_jobs'];
    case 'user':
      return ['search_services', 'hire_freelancers'];
    default:
      return [];
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  return getUserPermissions(user.role).includes(permission);
}

/**
 * Validate auth form data
 */
export function validateAuthForm(
  data: Record<string, any>,
  requiredFields: string[],
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
    }
  });

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Username validation
  if (data.username && data.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  // Password validation
  if (data.password && data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get auth error message
 */
export function getAuthErrorMessage(error: string | null): string {
  if (!error) return '';

  // Common auth error mappings
  const errorMap: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password',
    'user_not_found': 'User not found',
    'email_already_exists': 'Email already exists',
    'username_already_exists': 'Username already taken',
    'email_not_verified': 'Please verify your email address',
    'user_blocked': 'Your account has been blocked',
    'user_banned': 'Your account has been suspended',
    'invalid_token': 'Invalid or expired token',
    'password_too_weak': 'Password is too weak',
  };

  return errorMap[error] || error;
}