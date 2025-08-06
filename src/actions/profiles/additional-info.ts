'use server';

import { revalidateTag } from 'next/cache';
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
        errors: extractionErrors,
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

    // 5. Business logic validation - check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { uid: user.id },
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

    // 7. Revalidate cached data
    revalidateTag(`user-${user.id}`);
    revalidateTag(`profile-${user.id}`);
    revalidateTag('auth-data');
    revalidateTag('profiles');

    return {
      success: true,
      message: 'Τα πρόσθετα στοιχεία του προφίλ σας ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    // 8. Comprehensive error handling
    return handleBetterAuthError(error);
  }
}