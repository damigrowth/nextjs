'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { coverageSchema } from '@/lib/validations/profile';
import { getFormJSON } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { generateCoverageNormalized } from '@/lib/utils/datasets';

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
        message:
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα την εγγραφή σας.',
      };
    }

    // 6. Update profile with coverage and auto-generate normalized coverage
    const coverageNormalized = generateCoverageNormalized(data);

    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        coverage: data as any,
        coverageNormalized,
        updatedAt: new Date(),
      },
    });

    // 7. Revalidate cached data using centralized helper
    await revalidateProfile({
      profileId: existingProfile.id,
      userId: user.id,
      username: existingProfile.username,
      category: existingProfile.category,
      includeHome: existingProfile.featured,
      includeServices: true,
    });

    // Dashboard-specific revalidation
    revalidatePath('/dashboard/profile/coverage');

    // Revalidate all service pages that belong to this profile
    existingProfile.services.forEach(service => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    logCacheRevalidation('profile', existingProfile.id, 'coverage update');

    return {
      success: true,
      message: 'Οι περιοχές κάλυψης ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
