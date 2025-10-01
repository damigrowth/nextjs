'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResult, ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import {
  profileAdditionalInfoUpdateSchema,
  type ProfileAdditionalInfoUpdateInput,
} from '@/lib/validations/profile';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';

/**
 * Server action wrapper for useActionState
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function updateProfileAdditionalInfo(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Check permissions - only professionals can update profiles
    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα ενημέρωσης πρόσθετων στοιχείων προφίλ',
      };
    }

    // 3. Extract form data using utility function
    const { data: extractedData, errors: extractionErrors } = extractFormData(formData, {
      // Define your form fields and their types
      rate: { type: 'number', required: false, defaultValue: null },
      commencement: { type: 'string', required: false, defaultValue: '' },
      experience: { type: 'number', required: false, defaultValue: null },
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

    // 4. Validate with Zod schema
    const validationResult = profileAdditionalInfoUpdateSchema.safeParse(extractedData);

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα πρόσθετα στοιχεία προφίλ',
      );
    }

    const data = validationResult.data;

    // 5. Business logic validation - check if profile exists and get data for cache invalidation
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
        message: 'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα την εγγραφή σας.',
      };
    }

    // 6. Database operation - update profile with additional info
    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        rate: data.rate,
        commencement: data.commencement || null,
        experience: data.experience,
        contactMethods: data.contactMethods || [],
        paymentMethods: data.paymentMethods || [],
        settlementMethods: data.settlementMethods || [],
        budget: data.budget || null,
        industries: data.industries || [],
        terms: data.terms || null,
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
    revalidatePath('/dashboard/profile/additional-info');
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
      message: 'Τα πρόσθετα στοιχεία του προφίλ σας ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}