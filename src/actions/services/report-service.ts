'use server';

import { reportServiceFormSchema } from '@/lib/validations/service';
import { sendServiceReportEmail } from '@/lib/email/services/admin-emails';
import { requireAuth } from '@/actions/auth/server';
import { ActionResponse } from '@/lib/types/api';
import { getFormString, getFormNumber } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';

/**
 * Server action to report a service
 * Sends an email notification to the admin about the reported service
 */
export async function reportService(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    // Extract form data
    const serviceId = getFormNumber(formData, 'serviceId');
    const serviceTitle = getFormString(formData, 'serviceTitle');
    const serviceSlug = getFormString(formData, 'serviceSlug');
    const description = getFormString(formData, 'description');

    // Validate form data with Zod schema
    const validationResult = reportServiceFormSchema.safeParse({
      serviceId,
      serviceTitle,
      serviceSlug,
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
        message: 'Πρέπει να συνδεθείτε για να αναφέρετε υπηρεσία',
      };
    }

    // Prepare reporter details
    const reporterInfo = {
      id: reporter.id,
      name: reporter.displayName || reporter.username || 'Unknown User',
      email: reporter.email,
      username: reporter.username || reporter.email,
    };

    // Prepare service information
    const serviceInfo = {
      id: validatedData.serviceId,
      title: validatedData.serviceTitle,
      slug: validatedData.serviceSlug,
    };

    // Prepare report details
    const reportDetails = {
      details: validatedData.description,
    };

    // Construct service page URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doulitsa.gr';
    const servicePageUrl = `${baseUrl}/s/${validatedData.serviceSlug}`;

    // Send email notification to admin
    await sendServiceReportEmail(
      serviceInfo,
      reporterInfo,
      reportDetails,
      servicePageUrl
    );

    return {
      success: true,
      message: 'Η αναφορά σας υποβλήθηκε επιτυχώς. Θα την εξετάσουμε άμεσα.',
    };
  } catch (error) {
    console.error('[Report Service] Error:', error);

    // Return a user-friendly error message
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Παρουσιάστηκε σφάλμα κατά την υποβολή της αναφοράς',
    };
  }
}