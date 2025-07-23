'use server';

import { auth } from '@/lib/auth';
import { ActionResult } from '@/lib/types/api';
import { AuthUser } from '@/lib/types/auth';
import { requireAuth, hasRole, hasAnyRole } from '@/actions/auth/check-auth';

/**
 * Get current user (replaces getUserMe)
 */
export async function getCurrentUser(): Promise<ActionResult<AuthUser | null>> {
  try {
    const session = await auth.api.getSession({
      headers: {}
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
 * Get user by ID (admin only)
 */
export async function getUserById(userId: string): Promise<ActionResult<AuthUser | null>> {
  try {
    // Require admin access for viewing other users
    await requireAuth();
    const isAdmin = await hasRole('admin');
    
    if (!isAdmin.success || !isAdmin.data) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }

    // Use Better Auth admin API to get user by ID
    const user = await auth.api.getUser({
      body: { userId },
    });

    return {
      success: true,
      data: user || null,
    };
  } catch (error) {
    console.error('Get user by ID error:', error);
    return {
      success: false,
      error: 'Failed to get user',
    };
  }
}

/**
 * Check if current user has access to specific roles
 */
export async function checkAccess(roles: string | string[]): Promise<ActionResult<boolean>> {
  try {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const hasAccessResult = await hasAnyRole(roleArray);
    
    return hasAccessResult;
  } catch (error) {
    console.error('Check access error:', error);
    return {
      success: false,
      error: 'Failed to check access',
    };
  }
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<ActionResult<string | null>> {
  try {
    const userResult = await getCurrentUser();
    
    if (!userResult.success || !userResult.data) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: userResult.data.id,
    };
  } catch (error) {
    console.error('Get current user ID error:', error);
    return {
      success: false,
      error: 'Failed to get user ID',
    };
  }
}

/**
 * Search users (admin only)
 */
export async function searchUsers(query: string): Promise<ActionResult<AuthUser[]>> {
  try {
    // Require admin access
    await requireAuth();
    const isAdmin = await hasRole('admin');
    
    if (!isAdmin.success || !isAdmin.data) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }

    // This would need to be implemented with your database query
    // For now, returning empty array
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error('Search users error:', error);
    return {
      success: false,
      error: 'Failed to search users',
    };
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: string): Promise<ActionResult<void>> {
  try {
    // Require admin access
    await requireAuth();
    const isAdmin = await hasRole('admin');
    
    if (!isAdmin.success || !isAdmin.data) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }

    const result = await auth.api.updateUser({
      body: {
        userId,
        role,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Failed to update user role',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update user role error:', error);
    return {
      success: false,
      error: 'Failed to update user role',
    };
  }
}

/**
 * Block/unblock user (admin only)
 */
export async function toggleUserBlock(userId: string, blocked: boolean): Promise<ActionResult<void>> {
  try {
    // Require admin access
    await requireAuth();
    const isAdmin = await hasRole('admin');
    
    if (!isAdmin.success || !isAdmin.data) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }

    const result = await auth.api.updateUser({
      body: {
        userId,
        blocked,
      },
    });

    if (!result) {
      return {
        success: false,
        error: 'Failed to update user status',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Toggle user block error:', error);
    return {
      success: false,
      error: 'Failed to update user status',
    };
  }
}