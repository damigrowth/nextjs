'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import {
  profileAdditionalInfoUpdateSchema,
} from '@/lib/validations/profile';
import { extractFormData, getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';

/**
 * Admin-specific profile additional info update action
 * Allows admins to update any profile
 */
export async function updateProfileAdditionalInfoAdmin(
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
        message: 'Δεν έχετε δικαίωμα ενημέρωσης πρόσθετων στοιχείων προφίλ',
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

    // 4. Extract form data using utility function
    const { data: extractedData, errors: extractionErrors } = extractFormData(formData, {
      rate: { type: 'number', required: false, defaultValue: null },
      commencement: { type: 'string', required: false, defaultValue: '' },
      contactMethods: { type: 'json', required: false, defaultValue: [] },
      paymentMethods: { type: 'json', required: false, defaultValue: [] },
      settlementMethods: { type: 'json', required: false, defaultValue: [] },
      budget: { type: 'string', required: false, defaultValue: '' },
      industries: { type: 'json', required: false, defaultValue: [] },
      terms: { type: 'string', required: false, defaultValue: '' },
    });

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα φόρμας',
      };
    }

    // 5. Validate with Zod schema
    const validationResult = profileAdditionalInfoUpdateSchema.safeParse(extractedData);

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα πρόσθετα στοιχεία προφίλ',
      );
    }

    const data = validationResult.data;

    // 5.5. Calculate experience from commencement year (same as dashboard version)
    const currentYear = new Date().getFullYear();
    const calculatedExperience = data.commencement
      ? currentYear - parseInt(data.commencement)
      : null;

    // 6. Business logic validation - check if profile exists and get data for cache invalidation
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

    // 7. Database operation - update profile with additional info
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        rate: data.rate,
        commencement: data.commencement || null,
        experience: calculatedExperience,
        contactMethods: data.contactMethods || [],
        paymentMethods: data.paymentMethods || [],
        settlementMethods: data.settlementMethods || [],
        budget: data.budget || null,
        industries: data.industries || [],
        terms: data.terms || null,
        updatedAt: new Date(),
      },
    });

    // 8. Revalidate cached data using centralized helper
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
    existingProfile.services.forEach(service => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    logCacheRevalidation('profile', existingProfile.id, 'admin additional-info update');

    return {
      success: true,
      message: 'Τα πρόσθετα στοιχεία ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 9. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}
