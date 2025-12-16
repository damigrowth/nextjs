'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types/api';
import type { AuthType, ProRole } from '@/lib/types/auth';

interface UpdateUserTypeInput {
  userId: string;
  type: Exclude<AuthType, ''>;  // Only 'user' or 'pro'
  role?: ProRole;
}

/**
 * Update user type after OAuth type selection
 *
 * Called from /oauth-type-selection page when user selects their account type.
 * Updates user.type and user.role, then advances to OAUTH_SETUP step.
 */
export async function updateUserType({
  userId,
  type,
  role,
}: UpdateUserTypeInput): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Determine final role based on type
    let finalRole: string;

    if (type === 'user') {
      finalRole = 'user';
    } else if (type === 'pro') {
      // Pro users must have a role
      if (!role || !['freelancer', 'company'].includes(role)) {
        return {
          success: false,
          error: 'Επαγγελματίες χρήστες πρέπει να επιλέξουν τύπο λογαριασμού (Επαγγελματίας ή Επιχείρηση)',
        };
      }
      finalRole = role;
    } else {
      return {
        success: false,
        error: 'Μη έγκυρος τύπος λογαριασμού',
      };
    }

    // Update user type, role, and advance to OAUTH_SETUP step
    await prisma.user.update({
      where: { id: userId },
      data: {
        type,
        role: finalRole,
        step: 'OAUTH_SETUP', // Move to username setup
      },
    });

    // Revalidate oauth-setup page to ensure fresh data
    revalidatePath('/oauth-setup');

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error('Error updating user type:', error);
    return {
      success: false,
      error: 'Αποτυχία ενημέρωσης τύπου λογαριασμού',
    };
  }
}
