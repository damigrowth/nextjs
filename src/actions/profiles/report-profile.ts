'use server';

import { reportProfileSchema } from '@/lib/validations/profile';
import { sendProfileReportEmail } from '@/lib/email/services/admin-emails';
import { requireAuth } from '@/actions/auth/server';
import { ActionResponse } from '@/lib/types/api';
import { getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { prisma } from '@/lib/prisma/client';

/**
 * Server action to report a profile
 * Sends an email notification to the admin about the reported profile
 */
export async function reportProfile(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // Extract form data
    const profileId = getFormString(formData, 'profileId');
    const profileName = getFormString(formData, 'profileName');
    const profileUsername = getFormString(formData, 'profileUsername');
    const description = getFormString(formData, 'description');

    // Validate form data with Zod schema
    const validationResult = reportProfileSchema.safeParse({
      profileId,
      profileName,
      profileUsername,
      description,
    });

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα αναφοράς'
      );
    }

    const validatedData = validationResult.data;

    // Get the current user information
    const session = await requireAuth();
    const reporter = session.user;

    if (!reporter) {
      return {
        success: false,
        message: 'Πρέπει να συνδεθείτε για να αναφέρετε προφίλ',
      };
    }

    // Fetch reported profile with user data to get email
    const reportedProfile = await prisma.profile.findUnique({
      where: { id: validatedData.profileId },
      include: {
        user: {
          select: {
            email: true,
          }
        }
      }
    });

    if (!reportedProfile) {
      return {
        success: false,
        message: 'Το προφίλ δεν βρέθηκε',
      };
    }

    // Prepare reporter details
    const reporterInfo = {
      id: reporter.id,
      name: reporter.displayName || reporter.username || 'Unknown User',
      email: reporter.email,
      username: reporter.username || reporter.email,
    };

    // Prepare profile information
    const profileInfo = {
      id: validatedData.profileId,
      name: validatedData.profileName,
      email: reportedProfile.user?.email || 'N/A',
      username: validatedData.profileUsername,
    };

    // Prepare report details
    const reportDetails = {
      details: validatedData.description,
    };

    // Construct profile page URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr';
    const profilePageUrl = `${baseUrl}/profile/${validatedData.profileUsername}`;

    // Send email notification to admin
    await sendProfileReportEmail(
      profileInfo,
      reporterInfo,
      reportDetails,
      profilePageUrl
    );

    return {
      success: true,
      message: 'Η αναφορά σας υποβλήθηκε επιτυχώς. Θα την εξετάσουμε άμεσα.',
    };
  } catch (error) {
    console.error('[Report Profile] Error:', error);

    // Return a user-friendly error message
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Παρουσιάστηκε σφάλμα κατά την υποβολή της αναφοράς',
    };
  }
}