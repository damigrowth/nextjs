'use server';

import { supportFormSchema } from '@/lib/validations/support';
import { sendSupportFeedbackEmail } from '@/lib/email/services/admin-emails';
import { requireAuth } from '@/actions/auth/server';
import { ActionResponse } from '@/lib/types/api';
import { getFormString } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';

/**
 * Server action to submit support/feedback
 * Sends an email notification to the admin about the support request
 */
export async function submitFeedback(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // Extract form data
    const issueType = getFormString(formData, 'issueType') as 'problem' | 'option' | 'feature';
    const description = getFormString(formData, 'description');
    const pageUrl = getFormString(formData, 'pageUrl');

    // Validate form data with Zod schema
    const validationResult = supportFormSchema.safeParse({
      issueType,
      description,
      pageUrl,
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
    const user = session.user;

    if (!user) {
      return {
        success: false,
        message: 'Πρέπει να συνδεθείτε για να υποβάλετε αναφορά',
      };
    }

    // Prepare reporter details
    const reporterInfo = {
      id: user.id,
      name: user.displayName || user.username || 'Unknown User',
      email: user.email,
      username: user.username || user.email,
    };

    // Prepare feedback details
    const feedbackDetails = {
      issueType: validatedData.issueType,
      description: validatedData.description,
    };

    // Use provided page URL or fallback to default
    const submissionUrl = validatedData.pageUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr'}/dashboard`;

    // Send email notification to admin
    await sendSupportFeedbackEmail(
      reporterInfo,
      feedbackDetails,
      submissionUrl
    );

    return {
      success: true,
      message: 'Η αναφορά σας υποβλήθηκε επιτυχώς. Θα την εξετάσουμε άμεσα.',
    };
  } catch (error) {
    console.error('[Submit Feedback] Error:', error);

    // Return a user-friendly error message
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Παρουσιάστηκε σφάλμα κατά την υποβολή της αναφοράς',
    };
  }
}
