'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { sanitizeCloudinaryResources } from '@/lib/utils/cloudinary';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { updateProfilePortfolioSchema } from '@/lib/validations/profile';

/**
 * Server action to update portfolio only
 */
export async function updateProfilePortfolio(
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

    // 3. Extract form data
    const { data: extractedData, errors: extractionErrors } = extractFormData(
      formData,
      {
        portfolio: { type: 'json', required: false, defaultValue: [] },
      },
    );

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα φόρμας',
      };
    }

    // 4. Validate with Zod schema
    const validationResult = updateProfilePortfolioSchema.safeParse(extractedData);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα χαρτοφυλακίου',
      );
    }

    const data = validationResult.data;

    // 4.5. Sanitize portfolio resources before saving to database
    const sanitizedPortfolio = data.portfolio
      ? sanitizeCloudinaryResources(data.portfolio)
      : [];

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
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα τη ρύθμιση.',
      };
    }

    // 6. Database operation - update only portfolio
    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        portfolio: sanitizedPortfolio?.length
          ? (sanitizedPortfolio as any)
          : Prisma.DbNull,
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
    revalidatePath('/dashboard/profile/presentation');

    // Revalidate all service pages that belong to this profile
    existingProfile.services.forEach((service) => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    logCacheRevalidation('profile', existingProfile.id, 'portfolio update');

    return {
      success: true,
      message: 'Τα δείγματα εργασιών ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}
