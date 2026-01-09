'use server';

import { revalidateTag, revalidatePath, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import {
  verificationFormSchema,
  type VerificationInput,
} from '@/lib/validations/profile';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';
import { sendNewVerificationEmail } from '@/lib/email';

/**
 * Server action for submitting verification form
 * Creates or updates verification request for professional profiles
 */
export async function submitVerificationRequest(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Check permissions - only professionals can submit verification
    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        message: 'Δεν έχετε τα απαραίτητα δικαιώματα για πιστοποίηση',
      };
    }

    // 3. Extract form data
    const { data: extractedData, errors: extractionErrors } = extractFormData(
      formData,
      {
        afm: { type: 'string', required: true },
        name: { type: 'string', required: true },
        address: { type: 'string', required: true },
        phone: { type: 'string', required: true },
      },
    );

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα φόρμας',
      };
    }

    // 4. Validate with Zod schema
    const validationResult = verificationFormSchema.safeParse(extractedData);

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα πιστοποίησης',
      );
    }

    const data = validationResult.data;

    // 5. Check if user has a profile and get data for cache invalidation
    const profile = await prisma.profile.findUnique({
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

    if (!profile) {
      return {
        success: false,
        message:
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε την ρύθμιση του προφίλ σας πρώτα.',
      };
    }

    // 6. Check if verification already exists
    const existingVerification = await prisma.profileVerification.findUnique({
      where: { pid: profile.id },
    });

    if (existingVerification) {
      // Update existing verification
      const updatedVerification = await prisma.profileVerification.update({
        where: { pid: profile.id },
        data: {
          afm: data.afm,
          name: data.name,
          address: data.address,
          phone: data.phone,
          status: 'PENDING', // Reset status to pending on resubmission
          updatedAt: new Date(),
        },
      });

      // Send email notification to admin
      const userForEmail = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          email: true,
          displayName: true,
          username: true,
        },
      });

      if (userForEmail) {
        try {
          await sendNewVerificationEmail(
            userForEmail,
            profile.id,
            updatedVerification.id
          );
        } catch (emailError) {
          console.error('[Email] Failed to send verification update notification:', emailError);
        }
      }

      // 7. Revalidate cached data with consistent tags
      const profileTags = getProfileTags(profile);
      profileTags.forEach(tag => revalidateTag(tag));

      // Also revalidate user-specific tags
      revalidateTag(CACHE_TAGS.user.byId(user.id));
      revalidateTag(CACHE_TAGS.user.services(user.id));

      // Revalidate verification-specific tags
      revalidateTag(CACHE_TAGS.verification.byUserId(user.id));

      // Revalidate specific pages
      revalidatePath('/dashboard/profile/verification');
      if (profile.username) {
        revalidatePath(`/profile/${profile.username}`);
      }

      // Revalidate all service pages that belong to this profile
      profile.services.forEach(service => {
        if (service.slug) {
          revalidatePath(`/s/${service.slug}`);
        }
      });

      return {
        success: true,
        message:
          'Το αίτημα πιστοποίησης ενημερώθηκε επιτυχώς! Θα εξεταστεί από την ομάδα μας.',
      };
    } else {
      // Create new verification
      const newVerification = await prisma.profileVerification.create({
        data: {
          afm: data.afm,
          name: data.name,
          address: data.address,
          phone: data.phone,
          uid: user.id,
          pid: profile.id,
          status: 'PENDING',
        },
      });

      // Send email notification to admin
      const userForEmail = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          email: true,
          displayName: true,
          username: true,
        },
      });

      if (userForEmail) {
        try {
          await sendNewVerificationEmail(
            userForEmail,
            profile.id,
            newVerification.id
          );
        } catch (emailError) {
          console.error('[Email] Failed to send verification notification:', emailError);
        }
      }

      // 7. Revalidate cached data with consistent tags
      const profileTags = getProfileTags(profile);
      profileTags.forEach(tag => revalidateTag(tag));

      // Also revalidate user-specific tags
      revalidateTag(CACHE_TAGS.user.byId(user.id));
      revalidateTag(CACHE_TAGS.user.services(user.id));

      // Revalidate verification-specific tags
      revalidateTag(CACHE_TAGS.verification.byUserId(user.id));

      // Revalidate specific pages
      revalidatePath('/dashboard/profile/verification');
      if (profile.username) {
        revalidatePath(`/profile/${profile.username}`);
      }

      // Revalidate all service pages that belong to this profile
      profile.services.forEach(service => {
        if (service.slug) {
          revalidatePath(`/s/${service.slug}`);
        }
      });

      return {
        success: true,
        message:
          'Το αίτημα πιστοποίησης υποβλήθηκε επιτυχώς! Θα εξεταστεί από την ομάδα μας.',
      };
    }
  } catch (error: any) {
    console.error('Verification submission error:', error);
    return handleBetterAuthError(error);
  }
}

/**
 * Internal function to fetch verification data (uncached)
 */
async function _getVerificationByUserId(userId: string): Promise<{
  status: string;
  afm?: string;
  name?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
} | null> {
  // Get user's profile
  const profile = await prisma.profile.findUnique({
    where: { uid: userId },
    select: { id: true },
  });

  if (!profile) {
    return null;
  }

  // Get verification data
  return await prisma.profileVerification.findUnique({
    where: { pid: profile.id },
    select: {
      status: true,
      afm: true,
      name: true,
      address: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Get verification status for current user (cached)
 */
export async function getVerificationStatus(): Promise<{
  success: boolean;
  data?: {
    status: string;
    afm?: string;
    name?: string;
    address?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  message?: string;
}> {
  try {
    const session = await requireAuth();
    const user = session.user;

    const getCachedVerification = unstable_cache(
      _getVerificationByUserId,
      [`verification-${user.id}`],
      {
        tags: [`user-${user.id}`, `verification-${user.id}`, 'verifications'],
        revalidate: 10, // 5 minutes cache
      },
    );

    const verification = await getCachedVerification(user.id);

    return {
      success: true,
      data: verification,
    };
  } catch (error: any) {
    console.error('Get verification status error:', error);
    return {
      success: false,
      message: 'Σφάλμα κατά την ανάκτηση των στοιχείων πιστοποίησης',
    };
  }
}
