'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import { extractFormData, getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { sanitizeCloudinaryResources } from '@/lib/utils/cloudinary';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { updateProfilePortfolioSchema } from '@/lib/validations/profile';

/**
 * Admin-specific portfolio update action
 * Allows admins to update any profile
 */
export async function updateProfilePortfolioAdmin(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Check if user is admin
    const roleCheck = await hasAnyRole(['admin']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα ενημέρωσης προφίλ',
      };
    }

    // 3. Get the profile ID from formData (admin is updating someone else's profile)
    const profileId = getFormString(formData, 'profileId');
    if (!profileId) {
      return {
        success: false,
        message: 'Το αναγνωριστικό προφίλ δεν βρέθηκε',
      };
    }

    // 4. Extract form data
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

    // 5. Validate with Zod schema
    const validationResult = updateProfilePortfolioSchema.safeParse(extractedData);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα χαρτοφυλακίου',
      );
    }

    const data = validationResult.data;

    // 6. Sanitize portfolio resources before saving to database
    const sanitizedPortfolio = data.portfolio
      ? sanitizeCloudinaryResources(data.portfolio)
      : [];

    // 7. Check if profile exists and get data for cache invalidation
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
        message: 'Το προφίλ δεν βρέθηκε',
      };
    }

    // 8. Database operation - update only portfolio
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        portfolio: sanitizedPortfolio?.length
          ? (sanitizedPortfolio as any)
          : Prisma.DbNull,
        updatedAt: new Date(),
      },
    });

    // 9. Revalidate cached data using centralized helper
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

    // Revalidate all service pages that belong to this profile
    existingProfile.services.forEach((service) => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    logCacheRevalidation('profile', existingProfile.id, 'admin portfolio update');

    return {
      success: true,
      message: 'Τα δείγματα εργασιών ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 10. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}
