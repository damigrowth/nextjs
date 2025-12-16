'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse, ActionResult } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import {
  profilePresentationUpdateSchema,
  type ProfilePresentationUpdateInput,
} from '@/lib/validations/profile';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';

/**
 * Server action to update profile presentation info
 * Handles visibility settings, socials, viber, whatsapp, and portfolio
 */
export async function updateProfilePresentation(
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

    // 3. Extract form data using ENHANCED utility function
    const { data: extractedData, errors: extractionErrors } = extractFormData(
      formData,
      {
        phone: { type: 'string', required: false, defaultValue: null },
        website: { type: 'string', required: false, defaultValue: null },
        viber: { type: 'string', required: false, defaultValue: null },
        whatsapp: { type: 'string', required: false, defaultValue: null },
        visibility: {
          type: 'json',
          required: false,
          defaultValue: { email: false, phone: true, address: true },
        },
        socials: { type: 'json', required: false, defaultValue: {} },
      },
    );

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα φόρμας',
      };
    }

    // 4. Validate with Zod schema
    const validationResult =
      profilePresentationUpdateSchema.safeParse(extractedData);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα',
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

    // 6. Database operation - update all fields directly like additional-info pattern
    const result = await prisma.profile.update({
      where: { uid: user.id },
      data: {
        phone: data.phone || null,
        website: data.website || null,
        viber: data.viber || null,
        whatsapp: data.whatsapp || null,
        visibility: data.visibility || {
          email: false,
          phone: true,
          address: true,
        },
        socials: data.socials ? data.socials : Prisma.DbNull,
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
    existingProfile.services.forEach(service => {
      if (service.slug) {
        revalidatePath(`/s/${service.slug}`);
      }
    });

    logCacheRevalidation('profile', existingProfile.id, 'presentation update');

    return {
      success: true,
      message: 'Τα στοιχεία παρουσίασης ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}

/**
 * Server action to get profile presentation data
 * Returns the presentation-related fields from the profile
 */
export async function getProfilePresentation(): Promise<
  ActionResult<{
    id: string;
    phone: string | null;
    website: string | null;
    viber: string | null;
    whatsapp: string | null;
    visibility: any;
    socials: any;
  }>
> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Get profile with presentation data
    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: {
        id: true,
        phone: true,
        website: true,
        viber: true,
        whatsapp: true,
        visibility: true,
        socials: true,
      },
    });

    if (!profile) {
      return {
        success: false,
        error: 'Το προφίλ δεν βρέθηκε',
      };
    }

    // 3. Use JSON fields directly (no parsing needed since we fixed storage)
    const visibility = profile.visibility || null;
    const socials = profile.socials || null;

    return {
      success: true,
      data: {
        id: profile.id,
        phone: profile.phone,
        website: profile.website,
        viber: profile.viber,
        whatsapp: profile.whatsapp,
        visibility,
        socials,
      },
    };
  } catch (error) {
    console.error('Error getting profile presentation:', error);
    return {
      success: false,
      error: 'Παρουσιάστηκε σφάλμα κατά την ανάκτηση των στοιχείων παρουσίασης',
    };
  }
}
