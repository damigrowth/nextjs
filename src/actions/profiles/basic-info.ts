'use server';

import { revalidateTag } from 'next/cache';
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
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';

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

    // 6. Check if profile exists - we only update, never create
    const existingProfile = await prisma.profile.findUnique({
      where: { uid: user.id },
    });

    if (!existingProfile) {
      return {
        success: false,
        message:
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα την εγγραφή σας.',
      };
    }

    // 7. Update profile with proper JSON handling
    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        tagline: data.tagline,
        bio: data.bio,
        category: data.category,
        subcategory: data.subcategory,
        speciality: data.speciality,
        skills: data.skills || [],
        coverage: data.coverage as Prisma.JsonValue,
        image: data.image as Prisma.JsonValue,
        updatedAt: new Date(),
      },
    });

    // 7.5. Sync image to user table using Better Auth API (if image was updated)
    if (data.image !== undefined) {
      try {
        await auth.api.updateUser({
          headers: await headers(),
          body: {
            image: data.image ? JSON.stringify(data.image) : null,
          },
        });
      } catch (authError) {
        console.warn('Failed to update user via Better Auth, falling back to Prisma:', authError);
        // Fallback to direct Prisma update if Better Auth fails
        await prisma.user.update({
          where: { id: user.id },
          data: {
            image: data.image ? JSON.stringify(data.image) : null,
          },
        });
      }
    }

    // 8. Revalidate cached data using tags - this will refresh data everywhere
    revalidateTag(`user-${user.id}`);
    revalidateTag(`profile-${user.id}`);
    revalidateTag('auth-data');
    revalidateTag('profiles');

    return {
      success: true,
      message: 'Το προφίλ σας ενημερώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    // 9. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
