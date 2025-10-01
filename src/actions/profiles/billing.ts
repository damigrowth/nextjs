'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResult, ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import { billingSchema, type BillingInput } from '@/lib/validations/profile';
import { getFormString, getFormBoolean } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';

/**
 * Server action for updating profile billing information
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function updateProfileBilling(
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
    const receipt = getFormBoolean(formData, 'receipt');
    const invoice = getFormBoolean(formData, 'invoice');
    const afm = getFormString(formData, 'afm');
    const doy = getFormString(formData, 'doy');
    const name = getFormString(formData, 'name');
    const profession = getFormString(formData, 'profession');
    const address = getFormString(formData, 'address');

    // 4. Validate form data with Zod schema
    const validationResult = billingSchema.safeParse({
      receipt,
      invoice,
      afm,
      doy,
      name,
      profession,
      address,
    });

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα τιμολόγησης',
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
      },
    });

    if (!existingProfile) {
      return {
        success: false,
        message:
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα την εγγραφή σας.',
      };
    }

    // 6. Prepare billing data object
    const billingData = {
      receipt: data.receipt,
      invoice: data.invoice,
      afm: data.afm || '',
      doy: data.doy || '',
      name: data.name || '',
      profession: data.profession || '',
      address: data.address || '',
    };

    // 7. Update profile with billing information
    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        billing: billingData,
        updatedAt: new Date(),
      },
    });

    // 8. Revalidate cached data with consistent tags
    const profileTags = getProfileTags(existingProfile);
    profileTags.forEach(tag => revalidateTag(tag));

    // Also revalidate user-specific tags
    revalidateTag(CACHE_TAGS.user.byId(user.id));
    revalidateTag(CACHE_TAGS.user.services(user.id));

    // Revalidate profile services (they show profile data)
    revalidateTag(CACHE_TAGS.profile.services(existingProfile.id));
    revalidateTag(CACHE_TAGS.service.byProfile(existingProfile.id));

    // Revalidate specific pages
    revalidatePath('/dashboard/profile/billing');
    if (existingProfile.username) {
      revalidatePath(`/profile/${existingProfile.username}`);
    }

    return {
      success: true,
      message: 'Τα στοιχεία τιμολόγησης ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 9. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
