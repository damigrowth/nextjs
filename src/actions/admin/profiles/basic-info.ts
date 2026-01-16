'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { profileBasicInfoUpdateSchema } from '@/lib/validations/profile';
import { getFormString, getFormJSON } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { normalizeTerm } from '@/lib/utils/text/normalize';

/**
 * Admin-specific profile basic info update action
 * Allows admins to update any profile
 */
export async function updateProfileBasicInfoAdmin(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Check if user has admin or support role
    const roleCheck = await hasAnyRole(['admin', 'support']);
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

    // 4. Extract form data using utility functions
    const tagline = getFormString(formData, 'tagline');
    const bio = getFormString(formData, 'bio');
    const category = getFormString(formData, 'category');
    const subcategory = getFormString(formData, 'subcategory');
    const speciality = getFormString(formData, 'speciality');

    // Parse JSON fields with proper error handling
    const imageData = getFormJSON<any>(formData, 'image', null);
    const skillsData = getFormJSON<string[]>(formData, 'skills', []);
    const coverageData = getFormJSON<any>(formData, 'coverage', {});

    // 5. Validate JSON fields
    if (formData.get('image') && !imageData) {
      return {
        success: false,
        message: 'Λάθος δεδομένα εικόνας προφίλ',
      };
    }

    if (formData.get('coverage') && Object.keys(coverageData).length === 0) {
      return {
        success: false,
        message: 'Λάθος δεδομένα κάλυψης υπηρεσιών',
      };
    }

    // 6. Validate form data with Zod schema
    const validationResult = profileBasicInfoUpdateSchema.safeParse({
      tagline,
      bio,
      category,
      subcategory,
      speciality,
      image: imageData,
      skills: skillsData,
      coverage: coverageData,
    });

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα προφίλ',
      );
    }

    const data = validationResult.data;

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

    // 8. Update profile
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        tagline: data.tagline,
        taglineNormalized: data.tagline ? normalizeTerm(data.tagline) : null,
        bio: data.bio,
        bioNormalized: data.bio ? normalizeTerm(data.bio) : null,
        category: data.category,
        subcategory: data.subcategory,
        speciality: data.speciality,
        skills: data.skills || [],
        updatedAt: new Date(),
      },
    });

    // 9. Revalidate cached data using centralized helper
    await revalidateProfile({
      profileId: existingProfile.id,
      userId: existingProfile.uid,
      username: existingProfile.username,
      category: data.category, // Use updated category
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

    logCacheRevalidation('profile', existingProfile.id, 'admin basic-info update');

    return {
      success: true,
      message: 'Τα βασικά στοιχεία ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 12. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
