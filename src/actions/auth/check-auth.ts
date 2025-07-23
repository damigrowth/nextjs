'use server';

import { auth } from '@/lib/auth';
import { ActionResult } from '@/lib/types/api';
import { AuthUser, AuthSession } from '@/lib/types/auth';

/**
 * Check if user is authenticated and return user/session data
 */
export async function checkAuth(): Promise<ActionResult<{ user: AuthUser | null; session: AuthSession | null }>> {
  try {
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

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
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<ActionResult<AuthUser | null>> {
  try {
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

    return {
      success: true,
      data: session?.user || null,
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
export async function getCurrentSession(): Promise<ActionResult<AuthSession | null>> {
  try {
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
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
export async function hasRole(role: string): Promise<ActionResult<boolean>> {
  try {
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

    const userRole = (session?.user as any)?.role || 'user';
    
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
export async function hasAnyRole(roles: string[]): Promise<ActionResult<boolean>> {
  try {
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

    const userRole = (session?.user as any)?.role || 'user';
    
    return {
      success: true,
      data: roles.includes(userRole),
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
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const result = await getCurrentUser();
  
  if (!result.success || !result.data) {
    throw new Error('Authentication required');
  }
  
  return result.data;
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(role: string): Promise<AuthUser> {
  const user = await requireAuth();
  const roleCheck = await hasRole(role);
  
  if (!roleCheck.success || !roleCheck.data) {
    throw new Error(`Role ${role} required`);
  }
  
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole('admin');
}