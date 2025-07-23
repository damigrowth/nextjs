'use server';

import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { updateUserSchema } from '@/lib/validations/user';
import { ActionResult } from '@/lib/types/api';
import { UpdateUserInput } from '@/lib/validations/user';
import { requireAuth } from '../auth/check-auth';

const prisma = new PrismaClient();

/**
 * Update user information
 */
export async function updateUser(input: UpdateUserInput): Promise<ActionResult<any>> {
  try {
    const currentUser = await requireAuth();

    const validatedFields = updateUserSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Only allow admins to update other users or change roles
    if (data.role && (currentUser as any).role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can change user roles',
      };
    }

    // Use Better Auth to update user if it's auth-related fields
    if (data.name || data.username || data.displayName) {
      await auth.api.updateUser({
        body: {
          name: data.name,
          username: data.username,
          displayName: data.displayName,
        },
      });
    }

    // Update additional fields in Prisma
    const updateData: any = {};
    if (data.role !== undefined) updateData.role = data.role;
    if (data.step !== undefined) updateData.step = data.step;
    if (data.confirmed !== undefined) updateData.confirmed = data.confirmed;
    if (data.blocked !== undefined) updateData.blocked = data.blocked;
    if (data.banned !== undefined) updateData.banned = data.banned;
    if (data.banReason !== undefined) updateData.banReason = data.banReason;
    if (data.banExpires !== undefined) updateData.banExpires = data.banExpires;
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;

    let updatedUser = null;
    if (Object.keys(updateData).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: updateData,
        include: {
          profile: true,
        },
      });
    }

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error: any) {
    console.error('Update user error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user',
    };
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(preferences: any): Promise<ActionResult<any>> {
  try {
    const currentUser = await requireAuth();

    // Store preferences in user metadata or separate preferences table
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        // Assuming we store preferences in a JSON field or separate table
        // This would depend on your database schema
        metadata: preferences,
      },
    });

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error: any) {
    console.error('Update user preferences error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update preferences',
    };
  }
}

/**
 * Block/unblock user (admin only)
 */
export async function blockUser(userId: string, blocked: boolean, reason?: string): Promise<ActionResult<void>> {
  try {
    const currentUser = await requireAuth();

    if ((currentUser as any).role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can block users',
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        blocked,
        banReason: blocked ? reason : null,
      },
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Block user error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user status',
    };
  }
}

/**
 * Ban/unban user (admin only)
 */
export async function banUser(
  userId: string,
  banned: boolean,
  reason?: string,
  banExpires?: Date
): Promise<ActionResult<void>> {
  try {
    const currentUser = await requireAuth();

    if ((currentUser as any).role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can ban users',
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        banned,
        banReason: banned ? reason : null,
        banExpires: banned ? banExpires : null,
      },
    });

    // If banning, also revoke all active sessions
    if (banned) {
      await auth.api.revokeUserSessions({
        body: { userId },
      });
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Ban user error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user ban status',
    };
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(userId: string): Promise<ActionResult<void>> {
  try {
    const currentUser = await requireAuth();

    // Only allow users to delete their own account or admins to delete any account
    if (currentUser.id !== userId && (currentUser as any).role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized to delete this account',
      };
    }

    // Use Better Auth to delete user (this will cascade to related data)
    await auth.api.deleteUser({
      body: { userId },
    });

    return {
      success: true,
      data: undefined,
    };
  } catch (error: any) {
    console.error('Delete user account error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete user account',
    };
  }
}