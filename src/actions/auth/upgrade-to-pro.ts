'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { upgradeToProSchema } from '@/lib/validations/user';
import { ActionResponse } from '@/lib/types/api';
import { getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { UserType, UserRole, JourneyStep } from '@prisma/client';
import { getSession } from './server';
import { brevoWorkflowService } from '@/lib/email/providers/brevo/workflows';

/**
 * Upgrade a simple user account to a professional account.
 * Sets type='pro', role='freelancer'|'company', username, step='ONBOARDING'.
 * The existing onboarding guard will then enforce onboarding completion.
 */
export async function upgradeToProAccount(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // Extract and validate form data
    const validatedFields = upgradeToProSchema.safeParse({
      username: getFormString(formData, 'username'),
      role: getFormString(formData, 'role'),
    });

    if (!validatedFields.success) {
      return createValidationErrorResponse(
        validatedFields.error,
        'Μη έγκυρα δεδομένα αναβάθμισης λογαριασμού',
      );
    }

    const { username, role } = validatedFields.data;

    // Get current session
    const sessionResult = await getSession();

    if (!sessionResult.success || !sessionResult.data) {
      return {
        success: false,
        message: 'Πρέπει να είστε συνδεδεμένος για να αναβαθμίσετε τον λογαριασμό σας',
      };
    }

    const { user } = sessionResult.data;

    // Verify user is a simple user
    if (user?.type !== 'user') {
      return {
        success: false,
        message: 'Ο λογαριασμός σας είναι ήδη επαγγελματικός',
      };
    }

    // Check if username is already taken by another user
    const currentUsername = user.username?.toLowerCase();
    if (username !== currentUsername) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== user.id) {
        return {
          success: false,
          message: 'Αυτό το username χρησιμοποιείται ήδη',
        };
      }
    }

    // Get original case from form (before Zod lowercase transform)
    const originalCaseUsername = getFormString(formData, 'username');

    // Update user: type, role, username, step
    await prisma.user.update({
      where: { id: user.id },
      data: {
        type: 'pro' as UserType,
        role: role as UserRole,
        username,
        displayUsername: originalCaseUsername,
        step: 'ONBOARDING' as JourneyStep,
      },
    });

    // Sync Brevo list: USERS → EMPTYPROFILE
    await brevoWorkflowService.handleUserStateChange(user.id);

    // Clear Better Auth cookie cache to ensure session updates
    await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });

    // Revalidate dashboard so the layout guard picks up the new step
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Ο λογαριασμός σας αναβαθμίστηκε! Θα μεταφερθείτε στη σελίδα ολοκλήρωσης προφίλ.',
    };
  } catch (error) {
    console.error('Upgrade to pro error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Σφάλμα κατά την αναβάθμιση του λογαριασμού';

    return {
      success: false,
      message,
    };
  }
}
