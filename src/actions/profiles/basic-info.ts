'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResult, ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Prisma } from '@prisma/client';
import {
  profileBasicInfoUpdateSchema,
  type ProfileBasicInfoUpdateInput,
} from '@/lib/validations/profile';
import { getFormString, getFormJSON } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { CACHE_TAGS, getProfileTags, revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { normalizeTerm } from '@/lib/utils/text/normalize';

/**
 * Server action wrapper for useActionState
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function updateProfileBasicInfo(
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
    const tagline = getFormString(formData, 'tagline');
    const bio = getFormString(formData, 'bio');
    const category = getFormString(formData, 'category');
    const subcategory = getFormString(formData, 'subcategory');
    const speciality = getFormString(formData, 'speciality');

    // Parse JSON fields with proper error handling
    const imageData = getFormJSON<any>(formData, 'image', null);
    const skillsData = getFormJSON<string[]>(formData, 'skills', []);
    const coverageData = getFormJSON<any>(formData, 'coverage', {});

    // 4. Validate JSON fields
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

    // 5. Validate form data with Zod schema
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

    // 5.5. Check if profile exists and get data for cache invalidation
    const existingProfile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: {
        id: true,
        uid: true,
        username: true,
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

    // 6. Update profile
    await prisma.profile.update({
      where: { uid: user.id },
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

    // 7. Revalidate cached data using centralized helper
    await revalidateProfile({
      profileId: existingProfile.id,
      userId: user.id,
      username: existingProfile.username,
      category: data.category,
      includeHome: existingProfile.featured,
      includeServices: true,
    });

    // Dashboard-specific revalidation
    revalidatePath('/dashboard/profile/basic');

    // Revalidate all service pages that belong to this profile
    existingProfile.services.forEach((service) => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    logCacheRevalidation('profile', existingProfile.id, 'basic-info update');

    return {
      success: true,
      message: 'Τα βασικά στοιχεία ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 9. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
