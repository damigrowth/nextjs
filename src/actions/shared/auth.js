'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get the current user session from Better Auth
 * @returns {Promise<Object|null>} Session object or null
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get the current user from Better Auth
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Validate current session and return it
 * @returns {Promise<Object|null>} Valid session or null
 */
export async function validateSession() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

// ============================================================================
// AUTHENTICATION REQUIREMENTS (with redirects)
// ============================================================================

/**
 * Require user to be authenticated - redirect to signin if not
 * @param {string} redirectTo - Where to redirect unauthenticated users
 * @returns {Promise<Object>} Session object
 */
export async function requireAuth(redirectTo = '/auth/signin') {
  const session = await getSession();

  if (!session) {
    console.log('Authentication required - redirecting to:', redirectTo);
    redirect(redirectTo);
  }

  return session;
}

/**
 * Require user to have completed onboarding - redirect if not
 * Only applies to professional users (freelancer/company) - admin and regular users skip onboarding
 * @param {string} onboardingUrl - Where to redirect users who need onboarding
 * @returns {Promise<Object>} Session object
 */
export async function requireOnboardingComplete(onboardingUrl = '/onboarding') {
  const session = await requireAuth();

  // Skip onboarding check for admin and simple users
  if (session.user.role === 'admin' || session.user.role === 'user') {
    return session;
  }

  // Only check onboarding for professional users
  if (session.user?.step === 'ONBOARDING' && 
      (session.user.role === 'freelancer' || session.user.role === 'company')) {
    console.log('Onboarding required - redirecting to:', onboardingUrl);
    redirect(onboardingUrl);
  }

  return session;
}

/**
 * Require user to have specific role(s) - redirect if not authorized
 * @param {string|string[]} allowedRoles - Required roles
 * @param {string} redirectTo - Where to redirect unauthorized users
 * @returns {Promise<Object>} Session object
 */
export async function requireRole(allowedRoles, redirectTo = '/') {
  const session = await requireAuth();

  const roleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roleArray.includes(session.user.role)) {
    console.log(`Role '${session.user.role}' not in allowed roles:`, roleArray);
    redirect(redirectTo);
  }

  return session;
}

/**
 * Require user to have verified email - redirect if not
 * @param {string} verificationUrl - Where to redirect for email verification
 * @returns {Promise<Object>} Session object
 */
export async function requireEmailVerified(
  verificationUrl = '/email-confirmation',
) {
  const session = await requireAuth();

  if (!session.user.emailVerified) {
    console.log(
      'Email verification required - redirecting to:',
      verificationUrl,
    );
    redirect(verificationUrl);
  }

  return session;
}

/**
 * Require user to have completed profile - redirect if not
 * @param {string} profileUrl - Where to redirect for profile completion
 * @returns {Promise<Object>} Session object
 */
export async function requireProfileComplete(
  profileUrl = '/auth/complete-profile',
) {
  const session = await requireAuth();

  if (!session.user.confirmed) {
    console.log('Profile completion required - redirecting to:', profileUrl);
    redirect(profileUrl);
  }

  return session;
}

// ============================================================================
// CONDITIONAL REDIRECTS (for login/register pages)
// ============================================================================

/**
 * Block professional users with ONBOARDING step from accessing auth pages
 * Admin and regular users are not redirected
 * @param {string} onboardingUrl - Where to redirect onboarding users
 * @returns {Promise<Object|null>} Session or null
 */
export async function redirectOnboardingUsers(onboardingUrl = '/onboarding') {
  const session = await getSession();

  if (session && session.user?.step === 'ONBOARDING') {
    // Only redirect professional users to onboarding
    if (session.user.role === 'freelancer' || session.user.role === 'company') {
      console.log(
        'Redirecting ONBOARDING user from auth page to:',
        onboardingUrl,
      );
      redirect(onboardingUrl);
    }
  }

  return session;
}

/**
 * Redirect authenticated users with completed onboarding away from auth pages
 * @param {string} dashboardUrl - Where to redirect completed users
 * @returns {Promise<Object|null>} Session or null
 */
export async function redirectCompletedUsers(dashboardUrl = '/dashboard') {
  const session = await getSession();

  if (session && session.user?.step === 'DASHBOARD') {
    // Redirect admin users to admin panel, others to dashboard
    const redirectUrl = session.user.role === 'admin' ? '/admin' : dashboardUrl;
    console.log('Redirecting completed user from auth page to:', redirectUrl);
    redirect(redirectUrl);
  }

  return session;
}

// ============================================================================
// PERMISSION CHECKS (boolean returns - no redirects)
// ============================================================================

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Check if user has specific role(s)
 * @param {string|string[]} roles - Roles to check
 * @returns {Promise<boolean>}
 */
export async function hasRole(roles) {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Check if user has access based on role (alias for hasRole)
 * @param {string|string[]} roles - Roles to check
 * @returns {Promise<boolean>}
 */
export async function hasAccess(roles) {
  return await hasRole(roles);
}

/**
 * Check if user needs email verification
 * @returns {Promise<boolean>}
 */
export async function needsEmailVerification() {
  try {
    const user = await getCurrentUser();
    return user ? !user.emailVerified : false;
  } catch (error) {
    console.error('Error checking email verification status:', error);
    return false;
  }
}

/**
 * Check if user needs onboarding
 * Only professional users (freelancer/company) need onboarding
 * @returns {Promise<boolean>}
 */
export async function needsOnboarding() {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    // Admin and simple users never need onboarding
    if (user.role === 'admin' || user.role === 'user') {
      return false;
    }
    
    // Only professional users with ONBOARDING step need onboarding
    return user.step === 'ONBOARDING' && 
           (user.role === 'freelancer' || user.role === 'company');
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Check if user can access dashboard
 * @returns {Promise<boolean>}
 */
export async function canAccessDashboard() {
  try {
    const user = await getCurrentUser();
    return user
      ? user.emailVerified &&
          user.confirmed &&
          user.step === 'DASHBOARD' &&
          !user.blocked
      : false;
  } catch (error) {
    console.error('Error checking dashboard access:', error);
    return false;
  }
}

// ============================================================================
// ROLE-BASED PERMISSIONS
// ============================================================================

/**
 * Check if user is admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  return await hasRole('admin');
}

/**
 * Check if user is professional (freelancer or company)
 * @returns {Promise<boolean>}
 */
export async function isProfessional() {
  return await hasRole(['freelancer', 'company']);
}

/**
 * Check if user can create profile
 * @returns {Promise<boolean>}
 */
export async function canCreateProfile() {
  return await hasRole(['freelancer', 'company', 'admin']);
}

/**
 * Check if user can create services
 * @returns {Promise<boolean>}
 */
export async function canCreateServices() {
  return await hasRole(['freelancer', 'admin']);
}

// ============================================================================
// USER ROLE HELPERS
// ============================================================================

/**
 * Get user role information
 * @returns {Promise<Object|null>} Role information object
 */
export async function getUserRole() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    return {
      isSimpleUser: user.role === 'user',
      isFreelancer: user.role === 'freelancer',
      isCompany: user.role === 'company',
      isAdmin: user.role === 'admin',
      isProfessional: user.role === 'freelancer' || user.role === 'company',
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Get user type helpers (backward compatibility)
 * @returns {Promise<Object|null>}
 */
export async function getUserType() {
  return await getUserRole();
}

// ============================================================================
// LEGACY ALIASES (for backward compatibility)
// ============================================================================

// Keep old function names working for existing code
export const blockOnboardingUsers = redirectOnboardingUsers;
