'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { coverageSchema } from '@/lib/validations/profile';
import { getFormJSON } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';

/**
 * Server action for updating profile coverage
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function updateCoverage(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Check if user has permission to update profile (professionals only)
    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα ενημέρωσης προφίλ',
      };
    }

    // 3. Extract form data using utility functions
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

    if (!existingProfile) {
      return {
        success: false,
        message:
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα την εγγραφή σας.',
      };
    }

    // 6. Update profile with coverage
    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        coverage: data as any,
        updatedAt: new Date(),
      },
    });

    // 7. Revalidate cached data with consistent tags
    const profileTags = getProfileTags(existingProfile);
    profileTags.forEach(tag => revalidateTag(tag));

    // Also revalidate user-specific tags
    revalidateTag(CACHE_TAGS.user.byId(user.id));
    revalidateTag(CACHE_TAGS.user.services(user.id));

    // Revalidate profile services (they show profile data)
    revalidateTag(CACHE_TAGS.profile.services(existingProfile.id));
    revalidateTag(CACHE_TAGS.service.byProfile(existingProfile.id));

    // Revalidate specific pages
    revalidatePath('/dashboard/profile/coverage');
    if (existingProfile.username) {
      revalidatePath(`/profile/${existingProfile.username}`);
    }

    // Revalidate all service pages that belong to this profile
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
