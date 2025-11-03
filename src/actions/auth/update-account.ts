'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';
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
import { processImageForDatabase } from '@/lib/utils/cloudinary';

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
        image: { type: 'json', required: false },
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

    // Process image data - convert CloudinaryResource to URL string for database storage
    // Only process image for type='user' (simple users), not for type='pro'
    const processedImage =
      user.type === 'user' && data.image !== undefined
        ? processImageForDatabase(data.image)
        : undefined;

    // 4. Database & API operations
    // Get the profile if it exists (pro users have profiles, simple users don't)
    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: {
        id: true,
        uid: true,
        username: true,
        services: {
          where: { status: 'published' },
          select: { slug: true },
        },
      },
    });

    // Update the user - displayName for all, image only for type='user'
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: data.displayName,
        ...(user.type === 'user' && processedImage !== undefined && { image: processedImage }),
      },
    });

    // Update the profile if it exists (only for pro users)
    // Profile image is NOT updated here - pro users update their image in basic info form
    if (profile) {
      await prisma.profile.update({
        where: { uid: user.id },
        data: {
          displayName: data.displayName,
          // No image update for profile - pro users manage image in basic info
        },
      });
    }

    // Update Better Auth user data
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        displayName: data.displayName,
        name: data.displayName,
        ...(user.type === 'user' && processedImage !== undefined && { image: processedImage }),
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

    // 6. Revalidate cached data with consistent tags
    // Revalidate user-specific tags (for both simple and pro users)
    revalidateTag(CACHE_TAGS.user.byId(user.id));
    revalidateTag(CACHE_TAGS.user.services(user.id));

    // Revalidate profile-specific data only if profile exists (pro users)
    if (profile) {
      const profileTags = getProfileTags(profile);
      profileTags.forEach(tag => revalidateTag(tag));

      // Revalidate profile services (they show displayName)
      revalidateTag(CACHE_TAGS.profile.services(profile.id));
      revalidateTag(CACHE_TAGS.service.byProfile(profile.id));

      // Revalidate profile page
      if (profile.username) {
        revalidatePath(`/profile/${profile.username}`);
      }

      // Revalidate all service pages that belong to this profile
      profile.services.forEach(service => {
        if (service.slug) {
          revalidatePath(`/s/${service.slug}`);
        }
      });
    }

    // Revalidate account page for all users
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
