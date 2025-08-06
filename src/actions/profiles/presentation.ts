'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import {
  presentationSchema,
  type PresentationInput,
} from '@/lib/validations/profile';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';

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
    const { data: extractedData, errors: extractionErrors } = extractFormData(formData, {
      phone: { type: 'string', required: false, defaultValue: null },
      website: { type: 'string', required: false, defaultValue: null },
      viber: { type: 'string', required: false, defaultValue: null },
      whatsapp: { type: 'string', required: false, defaultValue: null },
      visibility: { type: 'json', required: false, defaultValue: { email: true, phone: true, address: true } },
      socials: { type: 'json', required: false, defaultValue: {} },
      portfolio: { type: 'json', required: false, defaultValue: [] },
    });

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα φόρμας',
        errors: extractionErrors,
      };
    }

    // 4. Validate with Zod schema
    const validationResult = presentationSchema.safeParse(extractedData);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα',
      );
    }

    const data = validationResult.data;

    // 5. Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { uid: user.id },
    });

    if (!existingProfile) {
      return {
        success: false,
        message: 'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα τη ρύθμιση.',
      };
    }

    // 6. Database operation
    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        phone: data.phone,
        website: data.website,
        viber: data.viber,
        whatsapp: data.whatsapp,
        visibility: JSON.stringify(data.visibility),
        socials: data.socials ? JSON.stringify(data.socials) : Prisma.DbNull,
        portfolio: data.portfolio?.length 
          ? JSON.stringify(data.portfolio) 
          : Prisma.DbNull,
        updatedAt: new Date(),
      },
    });

    // 7. Revalidate cached data
    revalidateTag(`user-${user.id}`);
    revalidateTag(`profile-${user.id}`);
    revalidateTag('auth-data');

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
export async function getProfilePresentation(): Promise<ActionResponse> {
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
        portfolio: true,
      },
    });

    if (!profile) {
      return {
        success: false,
        message: 'Το προφίλ δεν βρέθηκε',
      };
    }

    // 3. Parse JSON fields safely
    let visibility = null;
    let socials = null;
    let portfolio = null;

    try {
      visibility = profile.visibility ? JSON.parse(profile.visibility as string) : null;
    } catch (e) {
      console.warn('Failed to parse visibility JSON:', e);
    }

    try {
      socials = profile.socials ? JSON.parse(profile.socials as string) : null;
    } catch (e) {
      console.warn('Failed to parse socials JSON:', e);
    }

    try {
      portfolio = profile.portfolio ? JSON.parse(profile.portfolio as string) : null;
    } catch (e) {
      console.warn('Failed to parse portfolio JSON:', e);
    }

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
        portfolio,
      },
    };
  } catch (error) {
    console.error('Error getting profile presentation:', error);
    return {
      success: false,
      message: 'Παρουσιάστηκε σφάλμα κατά την ανάκτηση των στοιχείων παρουσίασης',
    };
  }
}