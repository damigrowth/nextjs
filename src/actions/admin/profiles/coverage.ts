'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { coverageSchema } from '@/lib/validations/profile';
import { getFormJSON, getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';

/**
 * Admin server action for updating profile coverage
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function updateCoverageAdmin(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();

    // 2. Check if user is admin
    const roleCheck = await hasAnyRole(['admin']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα διαχείρισης προφίλ',
      };
    }

    // 3. Extract form data including profileId for admin
    const profileId = getFormString(formData, 'profileId');

    if (!profileId) {
      return {
        success: false,
        message: 'Το αναγνωριστικό προφίλ δεν βρέθηκε',
      };
    }

    const coverage = getFormJSON(formData, 'coverage', {
      online: false,
      onbase: false,
      onsite: false,
      address: '',
      area: null,
      county: null,
      zipcode: null,
      counties: [],
      areas: [],
    });

    // 4. Validate form data with Zod schema
    const validationResult = coverageSchema.safeParse(coverage);

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα τρόπων παροχής',
      );
    }

    const data = validationResult.data;

    // 5. Check if profile exists and get data for cache invalidation
    const existingProfile = await prisma.profile.findUnique({
      where: { id: profileId },
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

    if (!existingProfile) {
      return {
        success: false,
        message: 'Το προφίλ δεν βρέθηκε.',
      };
    }

    // 6. Update profile with coverage
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        coverage: data as any,
        updatedAt: new Date(),
      },
    });

    // 7. Revalidate cached data with consistent tags
    const profileTags = getProfileTags(existingProfile);
    profileTags.forEach(tag => revalidateTag(tag));

    // Also revalidate user-specific tags
    revalidateTag(CACHE_TAGS.user.byId(existingProfile.uid));
    revalidateTag(CACHE_TAGS.user.services(existingProfile.uid));

    // Revalidate profile services
    revalidateTag(CACHE_TAGS.profile.services(existingProfile.id));
    revalidateTag(CACHE_TAGS.service.byProfile(existingProfile.id));

    // Revalidate admin list pages
    revalidateTag(CACHE_TAGS.admin.profiles);

    // Revalidate specific pages
    revalidatePath('/admin/profiles');
    revalidatePath(`/admin/profiles/${profileId}`);
    if (existingProfile.username) {
      revalidatePath(`/profile/${existingProfile.username}`);
    }

    // Revalidate all service pages
    existingProfile.services.forEach(service => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    return {
      success: true,
      message: 'Οι περιοχές κάλυψης ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
