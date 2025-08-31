'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { sanitizeCloudinaryResources } from '@/lib/utils/cloudinary';

// Portfolio-only validation schema
const portfolioSchema = z.object({
  portfolio: z.array(z.any()).optional(),
});

/**
 * Server action to update portfolio only
 */
export async function updateProfilePortfolio(
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

    // 3. Extract form data
    const { data: extractedData, errors: extractionErrors } = extractFormData(
      formData,
      {
        portfolio: { type: 'json', required: false, defaultValue: [] },
      },
    );

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα φόρμας',
      };
    }

    // 4. Validate with Zod schema
    const validationResult = portfolioSchema.safeParse(extractedData);
    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα χαρτοφυλακίου',
      );
    }

    const data = validationResult.data;

    // 4.5. Sanitize portfolio resources before saving to database
    const sanitizedPortfolio = data.portfolio
      ? sanitizeCloudinaryResources(data.portfolio)
      : [];

    // 5. Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { uid: user.id },
    });

    if (!existingProfile) {
      return {
        success: false,
        message:
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα τη ρύθμιση.',
      };
    }

    // 6. Database operation - update only portfolio
    await prisma.profile.update({
      where: { uid: user.id },
      data: {
        portfolio: sanitizedPortfolio?.length
          ? JSON.stringify(sanitizedPortfolio)
          : Prisma.DbNull,
        updatedAt: new Date(),
      },
    });

    // 7. Revalidate cached data
    revalidateTag(`user-${user.id}`);
    revalidateTag(`profile-${user.id}`);
    revalidateTag('auth-data');
    revalidateTag('profiles');

    return {
      success: true,
      message: 'Το χαρτοφυλάκιο ενημερώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}