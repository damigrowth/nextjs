'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { billingSchema } from '@/lib/validations/profile';
import { getFormString, getFormBoolean } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';

/**
 * Admin-specific billing update action
 * Allows admins to update any profile
 */
export async function updateProfileBillingAdmin(
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
    const receipt = getFormBoolean(formData, 'receipt');
    const invoice = getFormBoolean(formData, 'invoice');
    const afm = getFormString(formData, 'afm');
    const doy = getFormString(formData, 'doy');
    const name = getFormString(formData, 'name');
    const profession = getFormString(formData, 'profession');
    const address = getFormString(formData, 'address');

    // 5. Validate form data with Zod schema
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

    // 6. Check if profile exists and get data for cache invalidation
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

    // 7. Prepare billing data object
    const billingData = {
      receipt: data.receipt,
      invoice: data.invoice,
      afm: data.afm || '',
      doy: data.doy || '',
      name: data.name || '',
      profession: data.profession || '',
      address: data.address || '',
    };

    // 8. Update profile with billing information
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        billing: billingData,
        updatedAt: new Date(),
      },
    });

    // 9. Revalidate cached data with consistent tags
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
      message: 'Τα στοιχεία τιμολόγησης ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 10. Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
