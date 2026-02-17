'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';
import { changeUsernameSchema } from '@/lib/validations/user';
import { ActionResponse } from '@/lib/types/api';
import { getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import {
  checkCooldown,
  getNextChangeDate,
  USERNAME_COOLDOWN_DAYS,
} from '@/lib/utils/cooldown';
import { getSession } from './server';

/**
 * Change username for pro users with 7-day cooldown
 * Follows the same pattern as changePassword action
 */
export async function changeUsername(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // Extract and validate form data
    const validatedFields = changeUsernameSchema.safeParse({
      newUsername: getFormString(formData, 'newUsername'),
      confirmUsername: getFormString(formData, 'confirmUsername'),
    });

    if (!validatedFields.success) {
      return createValidationErrorResponse(
        validatedFields.error,
        'Μη έγκυρα δεδομένα αλλαγής username',
      );
    }

    const { newUsername } = validatedFields.data;

    // Get current session
    const sessionResult = await getSession();

    if (!sessionResult.success || !sessionResult.data) {
      return {
        success: false,
        message: 'Πρέπει να είστε συνδεδεμένος για να αλλάξετε το username σας',
      };
    }

    const user = sessionResult.data.user as any;

    // Check if user is pro
    if (user.type !== 'pro') {
      return {
        success: false,
        message: 'Μόνο επαγγελματίες μπορούν να αλλάξουν το username τους',
      };
    }

    // Check rate limit
    const lastChange = user.lastUsernameChangeAt
      ? new Date(user.lastUsernameChangeAt)
      : null;
    const cooldownCheck = checkCooldown(lastChange, USERNAME_COOLDOWN_DAYS);

    if (!cooldownCheck.allowed) {
      return {
        success: false,
        message: `Πρέπει να περιμένετε ${cooldownCheck.daysRemaining} ημέρες πριν αλλάξετε ξανά το username.`,
      };
    }

    // Check if new username is different from current
    const currentUsername = user.username?.toLowerCase();
    if (currentUsername === newUsername) {
      return {
        success: false,
        message: 'Το νέο username είναι ίδιο με το τρέχον',
      };
    }

    // Check if new username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: newUsername },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Αυτό το username χρησιμοποιείται ήδη',
      };
    }

    // Get old username for cache invalidation
    const oldUsername = user.username;

    // Get original case from form (before Zod lowercase transform)
    const originalCaseUsername = getFormString(formData, 'newUsername');

    // Update both User and Profile in a transaction, return profile ID for cache invalidation
    const profileId = await prisma.$transaction(async (tx) => {
      // Update User
      await tx.user.update({
        where: { id: user.id },
        data: {
          username: newUsername,
          displayUsername: originalCaseUsername, // Preserve original case from input
          lastUsernameChangeAt: new Date(),
        },
      });

      // Update Profile and get ID (if exists)
      const profile = await tx.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      });

      if (profile) {
        await tx.profile.update({
          where: { id: profile.id },
          data: { username: newUsername },
        });
      }

      return profile?.id;
    });

    // Clear Better Auth cookie cache to ensure session updates
    await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });

    // Invalidate caches
    // Profile-related tags
    revalidateTag(CACHE_TAGS.user.byId(user.id));
    revalidateTag(CACHE_TAGS.user.profile(user.id));

    if (profileId) {
      revalidateTag(CACHE_TAGS.profile.byId(profileId));
      revalidateTag(CACHE_TAGS.profile.services(profileId));
    }

    // Invalidate old and new username paths
    if (oldUsername) {
      revalidateTag(CACHE_TAGS.profile.byUsername(oldUsername));
      revalidateTag(CACHE_TAGS.profile.page(oldUsername));
      revalidatePath(`/profile/${oldUsername}`);
    }

    revalidateTag(CACHE_TAGS.profile.byUsername(newUsername));
    revalidateTag(CACHE_TAGS.profile.page(newUsername));
    revalidatePath(`/profile/${newUsername}`);

    // Archive pages
    revalidateTag(CACHE_TAGS.archive.all);
    revalidateTag(CACHE_TAGS.collections.profiles);
    revalidateTag(CACHE_TAGS.directory.all);

    return {
      success: true,
      message: 'Το username άλλαξε επιτυχώς!',
      data: {
        newUsername,
        nextChangeDate: getNextChangeDate(USERNAME_COOLDOWN_DAYS),
      },
    };
  } catch (error: any) {
    console.error('Change username error:', error);

    return {
      success: false,
      message: error.message || 'Σφάλμα κατά την αλλαγή του username',
    };
  }
}
