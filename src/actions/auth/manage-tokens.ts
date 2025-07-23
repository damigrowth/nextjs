'use server';

import { auth } from '@/lib/auth';
import { ActionResult } from '@/lib/types/api';
import { AuthSession } from '@/lib/types/auth';

/**
 * Get current session (replaces getToken)
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

    return session || null;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (replaces isAuthenticated)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Sign out user (replaces removeToken)
 */
export async function signOut(): Promise<ActionResult<void>> {
  try {
    await auth.api.signOut({});
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: 'Failed to sign out',
    };
  }
}

/**
 * Get authorization headers for API requests
 * Better Auth handles this automatically for server actions
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await getCurrentSession();
    
    if (!session?.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${session.token}`,
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {};
  }
}

/**
 * Refresh session (if supported by Better Auth)
 */
export async function refreshSession(): Promise<ActionResult<AuthSession | null>> {
  try {
    // Better Auth handles session refresh automatically
    const session = await getCurrentSession();
    
    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return {
      success: false,
      error: 'Failed to refresh session',
    };
  }
}