'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { coverageSchema } from '@/lib/validations/profile';
import { getFormJSON, getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { generateCoverageNormalized } from '@/lib/utils/datasets';

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

    // 2. Check if user has admin or support role
    const roleCheck = await hasAnyRole(['admin', 'support']);
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
        category: true,
        featured: true,
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

    // 6. Update profile with coverage and auto-generate normalized coverage
    const coverageNormalized = generateCoverageNormalized(data);

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        coverage: data as any,
        coverageNormalized,
        updatedAt: new Date(),
      },
    });

    // 7. Revalidate cached data using centralized helper
    await revalidateProfile({
      profileId: existingProfile.id,
      userId: existingProfile.uid,
      username: existingProfile.username,
      category: existingProfile.category,
      includeHome: existingProfile.featured, // Always include home for admin (featured might change)
      includeServices: true,
    });

    // Admin-specific revalidation
    revalidatePath('/admin/profiles');
    revalidatePath(`/admin/profiles/${profileId}`);

    // Revalidate all service pages
    existingProfile.services.forEach(service => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    logCacheRevalidation('profile', existingProfile.id, 'admin coverage update');

    return {
      success: true,
      message: 'Οι περιοχές κάλυψης ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
