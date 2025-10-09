'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  profileBasicInfoUpdateSchema,
} from '@/lib/validations/profile';
import { getFormString, getFormJSON } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { processImageForDatabase } from '@/lib/utils/cloudinary';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';

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

    // 7. Process image data - convert CloudinaryResource to URL string for database storage
    const processedImage = processImageForDatabase(data.image);

    // 8. Check if profile exists and get data for cache invalidation
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
        message: 'Το προφίλ δεν βρέθηκε',
      };
    }

    // 9. Update profile with string URL for image field
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        tagline: data.tagline,
        bio: data.bio,
        category: data.category,
        subcategory: data.subcategory,
        speciality: data.speciality,
        skills: data.skills || [],
        coverage: data.coverage,
        image: processedImage, // Now a string URL
        updatedAt: new Date(),
      },
    });

    // 10. Sync image to user table (if image was updated)
    // For admin operations updating other users, use Prisma directly
    // Better Auth's updateUser API only works for the current session user
    if (data.image !== undefined) {
      await prisma.user.update({
        where: { id: existingProfile.uid },
        data: {
          image: processedImage,
        },
      });
    }

    // 11. Revalidate cached data with consistent tags
    const profileTags = getProfileTags(existingProfile);
    profileTags.forEach(tag => revalidateTag(tag));

    // Also revalidate user-specific tags
    revalidateTag(CACHE_TAGS.user.byId(existingProfile.uid));
    revalidateTag(CACHE_TAGS.user.services(existingProfile.uid));

    // Revalidate profile services (they show profile data)
    revalidateTag(CACHE_TAGS.profile.services(existingProfile.id));
    revalidateTag(CACHE_TAGS.service.byProfile(existingProfile.id));

    // Revalidate specific pages
    revalidatePath(`/admin/profiles/${profileId}`);
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
      message: 'Το προφίλ ενημερώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    // 12. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
