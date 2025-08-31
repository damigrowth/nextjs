'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResult, ActionResponse } from '@/lib/types/api';
import { requireAuth } from '@/actions/auth/server';
import { Prisma, User } from '@prisma/client';
import {
  accountUpdateSchema,
  type AccountUpdateInput,
} from '@/lib/validations/auth';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Server action wrapper for useActionState
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function updateAccount(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Extract form data
    const { data: extractedData, errors: extractionErrors } = extractFormData(
      formData,
      {
        displayName: { type: 'string', required: true },
      },
    );

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα φόρμας.',
      };
    }

    // 3. Validate with Zod schema
    const validationResult = accountUpdateSchema.safeParse(extractedData);

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Το όνομα προβολής δεν είναι έγκυρο.',
      );
    }

    const data = validationResult.data;

    // 4. Database & API operations
    await prisma.profile.updateMany({
      where: { uid: user.id },
      data: {
        displayName: data.displayName,
      },
    });

    // Update Better Auth user data
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        displayName: data.displayName,
        name: data.displayName,
      },
    });

    // 5. Invalidate cookie cache and force fresh session data
    await auth.api.getSession({
      headers: await headers(),
      query: {
        disableCookieCache: true,
      },
    });
    
    // Force another session fetch to ensure cache is cleared
    await auth.api.getSession({
      headers: await headers(),
      query: {
        disableCookieCache: true,
      },
    });

    // 6. Revalidate cached data (this forces fresh fetch on next request)
    revalidateTag(`user-${user.id}`);
    revalidateTag(`profile-${user.id}`);
    revalidateTag('profiles');
    
    // Also revalidate the page itself
    revalidatePath('/dashboard/profile/account');

    return {
      success: true,
      message: 'Ο λογαριασμός σας ενημερώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    // 7. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}
