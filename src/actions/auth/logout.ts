'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ActionResult } from '@/lib/types/api';

export async function logout(): Promise<void> {
  try {
    await auth.api.signOut({
      body: {},
    });
    
    redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    redirect('/');
  }
}

/**
 * Logout function that returns a result instead of redirecting
 */
export async function logoutUser(): Promise<ActionResult<void>> {
  try {
    await auth.api.signOut({
      body: {},
    });
    
    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Logout failed',
    };
  }
}

/**
 * Logout from all sessions
 */
export async function logoutAllSessions(): Promise<ActionResult<void>> {
  try {
    // Get current user to revoke all their sessions
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

    if (session?.user) {
      // Revoke all sessions for this user
      await auth.api.revokeUserSessions({
        body: {
          userId: session.user.id,
        },
      });
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Logout all sessions error:', error);
    return {
      success: false,
      error: 'Failed to logout from all sessions',
    };
  }
}