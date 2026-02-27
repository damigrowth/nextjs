'use server';

import { unstable_cache } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ActionResult } from '@/lib/types/api';
import { AuthUser, AuthSession } from '@/lib/types/auth';
import { Profile, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getProfileByUserId } from '@/actions/profiles/get-profile';
import { Session } from 'better-auth';
import { prisma } from '@/lib/prisma/client';
import { brevoWorkflowService } from '@/lib/email/providers/brevo/workflows';

/**
 * Check if user is authenticated and return user/session data
 */
/**
 * Fresh server-side session getter - uses fresh data for recent users, cached for established users
 */
export async function getFreshServerSession(): Promise<
  ActionResult<{ user: AuthUser | null; session: AuthSession | null }>
> {
  try {
    // First get cached session
    const cachedResult = await getSession();
    
    if (!cachedResult.success) {
      return cachedResult;
    }

    const user = cachedResult.data.user;
    
    // For recently registered users (< 10 minutes), get fresh data
    const isRecentUser = user?.createdAt && 
      new Date().getTime() - new Date(user.createdAt).getTime() < 10 * 60 * 1000;
    
    if (isRecentUser) {
      console.log('Recent user detected - fetching fresh server session');
      return await getSession({ revalidate: true });
    } else {
      console.log('Established user - using cached server session');
      return cachedResult;
    }
  } catch (error) {
    console.error('Fresh server session error:', error);
    return {
      success: false,
      error: 'Failed to get fresh server session',
    };
  }
}

/**
 * Check if user is authenticated and return user/session data
 */
export async function getSession(
  options: { revalidate?: boolean } = {},
): Promise<
  ActionResult<{ user: AuthUser | null; session: AuthSession | null }>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      ...(options.revalidate && {
        query: {
          disableCookieCache: true,
        },
      }),
    });

    // console.log('getSession - session found: =>>>>>>>>>>>>>>>', session);
    // If we have a session but no user, the user was likely deleted
    if (session && !session.user) {
      // console.log(
      //   'Session exists but user is null - user may have been deleted',
      // );
      return {
        success: false,
        error: 'Invalid session - user not found',
      };
    }

    // Database validation REMOVED for performance (ML15-290)
    // This check was added in ML15-142 but causes severe performance issues (60-73s per call)
    // due to unstable database connections during Supabase maintenance (Jan 26 - Feb 2, 2026)
    // and approaching egress quota limits (98% usage).
    //
    // Better Auth already handles deleted users properly via:
    // 1. deleteUser hook cleans up sessions automatically (src/lib/auth/config.ts:200-234)
    // 2. Session validation returns null user if account deleted
    // 3. The session.user check above (line 73) catches orphaned sessions
    //
    // The database round trip is unnecessary and blocks all admin operations.
    // If we need deleted user detection in the future, implement it as:
    // - Background job to clean up orphaned sessions
    // - Lazy validation on critical operations only
    // - Cached validation with longer TTL (5-10 minutes)
    //
    // ORIGINAL CODE (commented out for reference):
    // if (session?.user?.id) {
    //   try {
    //     const dbUser = await prisma.user.findUnique({
    //       where: { id: session.user.id },
    //     });
    //     if (!dbUser) {
    //       return {
    //         success: false,
    //         error: 'User account no longer exists',
    //       };
    //     }
    //   } catch (dbError) {
    //     console.error('Database check error:', dbError);
    //   }
    // }

    return {
      success: true,
      data: {
        user: session?.user || null,
        session: session || null,
      },
    };
  } catch (error) {
    console.error('Check auth error:', error);
    return {
      success: false,
      error: 'Authentication check failed',
    };
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(redirectTo = '/login') {
  const sessionResult = await getSession({ revalidate: true });

  if (!sessionResult.success || !sessionResult.data.session) {
    // console.log('Authentication required - redirecting to:', redirectTo);
    redirect(redirectTo);
  }

  return sessionResult.data.session;
}

/**
 * Internal function to fetch profile data (cached, no dynamic data)
 */
async function _getProfileForUser(userId: string): Promise<Profile | null> {
  const profileResult = await getProfileByUserId(userId);
  if (profileResult.success) {
    return profileResult.data;
  }
  return null;
}

/**
 * Get current authenticated user with complete profile
 * Uses Better Auth cookie caching + selective profile caching
 */
export async function getCurrentUser(
  options: { revalidate?: boolean } = {},
): Promise<
  ActionResult<{
    user: AuthUser | null;
    profile: Profile | null;
    session: Session | null;
  }>
> {
  try {
    // Get session (optionally revalidate cache for fresh data)
    const sessionResult = await getSession(options);

    if (!sessionResult.success) {
      return {
        success: false,
        error: sessionResult.error,
      };
    }

    const { session: fullSessionData } = sessionResult.data;
    const user = fullSessionData?.user || null;
    const session = fullSessionData?.session || null;
    let profile: Profile | null = null;

    // Only cache profile data if user exists
    if (user?.id) {
      // Cache only the profile fetch, not the session
      // Use shorter cache time for recently registered users
      const isRecentUser = user.createdAt && 
        new Date().getTime() - new Date(user.createdAt).getTime() < 10 * 60 * 1000; // 10 minutes
      
      const getCachedProfile = unstable_cache(
        _getProfileForUser,
        [`user-profile-${user.id}`],
        {
          tags: [`user-${user.id}`, `profile-${user.id}`, 'profiles'],
          revalidate: isRecentUser ? 60 : 300, // 1 minute for new users, 5 minutes for established users
        },
      );

      profile = await getCachedProfile(user.id);
    }

    return {
      success: true,
      data: { user, profile, session },
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: 'Failed to get current user',
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<
  ActionResult<AuthSession | null>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return {
      success: true,
      data: session || null,
    };
  } catch (error) {
    console.error('Get current session error:', error);
    return {
      success: false,
      error: 'Failed to get current session',
    };
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<ActionResult<boolean>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = session?.user?.role || 'user';

    return {
      success: true,
      data: userRole === role,
    };
  } catch (error) {
    console.error('Check role error:', error);
    return {
      success: false,
      error: 'Failed to check user role',
    };
  }
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(
  roles: UserRole[],
): Promise<ActionResult<boolean>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userRole = session?.user?.role || 'user';

    return {
      success: true,
      data: roles.includes(userRole as UserRole),
    };
  } catch (error) {
    console.error('Check roles error:', error);
    return {
      success: false,
      error: 'Failed to check user roles',
    };
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<ActionResult<boolean>> {
  return hasRole('admin');
}

/**
 * Check if user is professional (freelancer or company)
 */
export async function isProfessional(): Promise<ActionResult<boolean>> {
  return hasAnyRole(['freelancer', 'company']);
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(role: UserRole): Promise<AuthUser> {
  const session = await requireAuth();
  const roleCheck = await hasRole(role);

  if (!roleCheck.success || !roleCheck.data) {
    redirect('/login');
  }

  return session.user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole('admin');
}

/**
 * Require any of the specified roles - throws if user doesn't have any role
 */
export async function requireAnyRole(roles: UserRole[]): Promise<AuthUser> {
  const session = await requireAuth();
  const roleCheck = await hasAnyRole(roles);

  if (!roleCheck.success || !roleCheck.data) {
    redirect('/login');
  }

  return session.user;
}

/**
 * Check if user has any admin role (admin, support, or editor)
 */
export async function hasAdminRole(): Promise<boolean> {
  const result = await hasAnyRole(['admin', 'support', 'editor']);
  return result.success && result.data;
}

export async function requireOnboardingComplete(onboardingUrl = '/onboarding') {
  // Get cached user + profile data together (uses unstable_cache)
  let userResult = await getCurrentUser();

  if (!userResult.success || !userResult.data.session) {
    redirect('/login');
  }

  let { user, profile, session } = userResult.data;

  // Time-based revalidation: revalidate for users created in the last 10 minutes
  // This ensures fresh registrations get updated data while keeping cache benefits for established users
  const shouldRevalidateByTime = user?.createdAt &&
    new Date().getTime() - new Date(user.createdAt).getTime() < 10 * 60 * 1000; // 10 minutes

  if (shouldRevalidateByTime) {
    console.log('Revalidating session for recently registered user');
    const freshResult = await getCurrentUser({ revalidate: true });

    if (freshResult.success && freshResult.data.session) {
      user = freshResult.data.user;
      profile = freshResult.data.profile;
      session = freshResult.data.session;
    }
  }

  // Check if this is a Google OAuth user who needs setup (type selection or username)
  // Both TYPE_SELECTION and OAUTH_SETUP are handled in /oauth-setup page
  if (
    user?.provider === 'google' &&
    (user?.step === 'TYPE_SELECTION' || user?.step === 'OAUTH_SETUP')
  ) {
    redirect('/oauth-setup');
  }

  // Skip onboarding check for admin users
  if (user?.role === 'admin') {
    return session;
  }

  // Skip onboarding check for simple users (type 'user')
  if (user?.type === 'user') {
    return session;
  }

  // Check onboarding for pro users (type 'pro')
  if (user?.type === 'pro' && user?.step === 'ONBOARDING') {
    console.log('Pro user onboarding required - redirecting to:', onboardingUrl);
    redirect(onboardingUrl);
  }

  // Check if pro user has completed all required profile fields
  // Uses already-fetched cached profile data - no extra DB query
  if (user?.type === 'pro' && user?.step === 'DASHBOARD') {
    const missingImage = !profile?.image;
    const missingCategory = !profile?.category;
    const missingSubcategory = !profile?.subcategory;

    if (missingImage || missingCategory || missingSubcategory) {
      console.log('Pro user missing required profile fields - setting step to ONBOARDING');

      // Update step to ONBOARDING so OnboardingGuard will allow access
      // This prevents infinite redirect loops
      try {
        await auth.api.updateUser({
          headers: await headers(),
          body: { step: 'ONBOARDING' }
        });
      } catch (authError) {
        console.warn('Failed to update user step via Better Auth, falling back to Prisma:', authError);
        // Fallback to direct Prisma update if Better Auth fails
        await prisma.user.update({
          where: { id: user.id },
          data: { step: 'ONBOARDING' }
        });
      }

      // Sync Brevo list after step change (DASHBOARD → ONBOARDING)
      brevoWorkflowService.handleUserStateChange(user.id).catch(console.error);

      redirect(onboardingUrl);
    }
  }

  return session;
}

/**
 * Require user to have specific role(s) - redirect if not authorized
 */
export async function requireRoleRedirect(
  allowedRoles: string | string[],
  redirectTo = '/',
) {
  const session = await requireAuth();

  const roleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roleArray.includes(session?.user?.role || '')) {
    // console.log(
    //   `Role '${session?.user?.role}' not in allowed roles:`,
    //   roleArray,
    // );
    redirect(redirectTo);
  }

  return session;
}

/**
 * Require user to have verified email - redirect if not
 */
export async function requireEmailVerified(
  verificationUrl = '/email-confirmation',
) {
  const session = await requireAuth();

  if (!session?.user?.emailVerified) {
    // console.log(
    //   'Email verification required - redirecting to:',
    //   verificationUrl,
    // );
    redirect(verificationUrl);
  }

  return session;
}

/**
 * Require user to have completed profile - redirect if not
 */
export async function requireProfileComplete(
  profileUrl = '/auth/complete-profile',
) {
  const session = await requireAuth();

  if (!session?.user?.confirmed) {
    // console.log('Profile completion required - redirecting to:', profileUrl);
    redirect(profileUrl);
  }

  return session;
}

/**
 * Block professional users with ONBOARDING step from accessing auth pages
 */
export async function redirectOnboardingUsers(onboardingUrl = '/onboarding') {
  const sessionResult = await getSession();

  if (!sessionResult.success) {
    return null;
  }

  const session = sessionResult.data.session;

  if (session && session.user?.step === 'ONBOARDING') {
    // Only redirect professional users to onboarding
    if (session.user.role === 'freelancer' || session.user.role === 'company') {
      // console.log(
      //   'Redirecting ONBOARDING user from auth page to:',
      //   onboardingUrl,
      // );
      redirect(onboardingUrl);
    }
  }

  return session;
}

/**
 * Redirect authenticated users with completed onboarding away from auth pages
 */
export async function redirectCompletedUsers(dashboardUrl = '/dashboard') {
  const sessionResult = await getSession();

  if (!sessionResult.success) {
    return null;
  }

  const session = sessionResult.data.session;

  if (session && session.user?.step === 'DASHBOARD') {
    // Redirect all admin roles to admin panel, others to dashboard
    const isAdminRole = session.user.role === 'admin' ||
                       session.user.role === 'support' ||
                       session.user.role === 'editor';
    const redirectUrl = isAdminRole ? '/admin' : dashboardUrl;
    // console.log('Redirecting completed user from auth page to:', redirectUrl);
    redirect(redirectUrl);
  }

  return session;
}

/**
 * Redirect OAuth users who need role assignment to the setup page
 */
export async function redirectOAuthUsersToSetup() {
  // First check with cache
  const sessionResult = await getSession();

  if (!sessionResult.success) {
    return null;
  }

  const session = sessionResult.data.session;
  const user = session?.user;

  // If user looks like they need OAuth setup, double-check with fresh data
  if (
    user?.provider === 'google' &&
    user?.step === 'OAUTH_SETUP'
  ) {
    // Get fresh data to confirm this is really a Google OAuth user needing setup
    const freshSessionResult = await getSession({ revalidate: true });
    const freshSession = freshSessionResult.data?.session;
    const freshUser = freshSession?.user;

    // Only redirect if fresh data confirms they need OAuth setup
    if (
      freshUser?.provider === 'google' &&
      freshUser?.step === 'OAUTH_SETUP'
    ) {
      // console.log('Redirecting Google OAuth user to setup');
      redirect('/oauth-setup');
    }

    return freshSession;
  }

  return session;
}

/**
 * Check if user is a pro user (type === 'pro')
 */
export async function isProUser(): Promise<boolean> {
  const result = await getCurrentUser();
  return result.success && result.data.user?.type === 'pro';
}

/**
 * Require pro user type - redirect if user is not pro
 */
export async function requireProUser(redirectTo = '/dashboard/profile/account') {
  const result = await getCurrentUser();

  if (!result.success || result.data.user?.type !== 'pro') {
    redirect(redirectTo);
  }

  return result.data;
}

// =============================================
// ADMIN PERMISSION SYSTEM
// =============================================

/**
 * Get current user's role from session
 */
async function getCurrentRole(): Promise<string | null> {
  const sessionResult = await getSession({ revalidate: true });
  if (!sessionResult.success || !sessionResult.data.session) {
    return null;
  }
  return sessionResult.data.session.user.role || null;
}

/**
 * Check if current user has permission to access a resource
 *
 * @param resource - The admin resource to check
 * @returns Promise<boolean> - True if user has any access level
 */
export async function hasPermission(resource: string): Promise<boolean> {
  const { hasAccess } = await import('@/lib/auth/roles');
  const role = await getCurrentRole();
  return hasAccess(role, resource as any);
}

/**
 * Check if current user can edit a resource
 *
 * @param resource - The admin resource to check
 * @returns Promise<boolean> - True if user has edit or full access
 */
export async function canEditResource(resource: string): Promise<boolean> {
  const { canEdit } = await import('@/lib/auth/roles');
  const role = await getCurrentRole();
  return canEdit(role, resource as any);
}

/**
 * Check if current user has full access to a resource
 *
 * @param resource - The admin resource to check
 * @returns Promise<boolean> - True if user has full access
 */
export async function hasFullPermission(resource: string): Promise<boolean> {
  const { hasFullAccess } = await import('@/lib/auth/roles');
  const role = await getCurrentRole();
  return hasFullAccess(role, resource as any);
}

/**
 * Require permission to access a resource - redirect if unauthorized
 *
 * @param resource - The admin resource to check
 * @param redirectTo - Where to redirect if unauthorized (default: /admin)
 * @throws Redirects to specified URL if user lacks permission
 */
export async function requirePermission(
  resource: string,
  redirectTo: string = '/admin',
): Promise<void> {
  const hasAccess = await hasPermission(resource);
  if (!hasAccess) {
    redirect(redirectTo);
  }
}

/**
 * Require edit permission for a resource - redirect if unauthorized
 *
 * @param resource - The admin resource to check
 * @param redirectTo - Where to redirect if unauthorized (default: /admin)
 * @throws Redirects to specified URL if user lacks edit permission
 */
export async function requireEditPermission(
  resource: string,
  redirectTo: string = '/admin',
): Promise<void> {
  const canEdit = await canEditResource(resource);
  if (!canEdit) {
    redirect(redirectTo);
  }
}

/**
 * Require full permission for a resource - redirect if unauthorized
 *
 * @param resource - The admin resource to check
 * @param redirectTo - Where to redirect if unauthorized (default: /admin)
 * @throws Redirects to specified URL if user lacks full permission
 */
export async function requireFullPermission(
  resource: string,
  redirectTo: string = '/admin',
): Promise<void> {
  const hasFull = await hasFullPermission(resource);
  if (!hasFull) {
    redirect(redirectTo);
  }
}

/**
 * Get filtered admin navigation items based on current user's role
 *
 * Returns only the navigation items the user has permission to access
 */
export async function getAdminNavigationItems() {
  const {
    ADMIN_RESOURCES,
    ROLE_PERMISSIONS,
    isAdminRole,
  } = await import('@/lib/auth/roles');
  const role = await getCurrentRole();

  if (!role || !isAdminRole(role)) {
    return [];
  }

  // Map resource names to navigation items
  const resourceToNav: Record<string, string> = {
    [ADMIN_RESOURCES.DASHBOARD]: '/admin',
    [ADMIN_RESOURCES.SERVICES]: '/admin/services',
    [ADMIN_RESOURCES.VERIFICATIONS]: '/admin/verifications',
    [ADMIN_RESOURCES.PROFILES]: '/admin/profiles',
    [ADMIN_RESOURCES.USERS]: '/admin/users',
    [ADMIN_RESOURCES.TEAM]: '/admin/team',
    [ADMIN_RESOURCES.TAXONOMIES]: '/admin/taxonomies',
    [ADMIN_RESOURCES.CHATS]: '/admin/chats',
    [ADMIN_RESOURCES.ANALYTICS]: '/admin/analytics',
    [ADMIN_RESOURCES.GIT]: '/admin/git',
  };

  // Filter resources based on role permissions
  const permissions = ROLE_PERMISSIONS[role as any];
  const allowedResources: string[] = [];

  for (const [resource, permission] of Object.entries(permissions)) {
    if (permission !== null) {
      allowedResources.push(resource);
    }
  }

  // Map allowed resources to navigation URLs
  return allowedResources
    .map((resource) => resourceToNav[resource])
    .filter(Boolean);
}

/**
 * Check if a specific navigation item should be visible for current user
 *
 * @param navUrl - The navigation URL to check (e.g., '/admin/team')
 * @returns Promise<boolean> - True if user should see this nav item
 */
export async function canViewNavItem(navUrl: string): Promise<boolean> {
  const allowedItems = await getAdminNavigationItems();
  return allowedItems.includes(navUrl);
}
