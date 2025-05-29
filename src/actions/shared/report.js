'use server';

import { postData } from '@/lib/client/operations';
import { CONTACT } from '@/lib/graphql';

import { ReportSchema } from '../schema/report';
import { getFreelancer } from './freelancer';

/**
 * A map of issue type IDs to their display labels.
 * @type {Object<string, string>}
 */
const issueOptionsMap = {
  bug_report: 'Αναφορά Προβλήματος',
  new_option: 'Προσθήκη μιας νέας επιλογής',
  feature_request: 'Πρόταση νέας δυνατότητας',
};

/**
 * Server action to create an issue report.
 * Validates the form data and sends it via a GraphQL mutation.
 * @param {Object | null} prevState - The previous state of the form action.
 * @param {FormData} formData - The form data submitted by the user.
 * @returns {Promise<Object>} An object containing messages, errors, or success status.
 * @property {string | null} message - A general message for the user.
 * @property {string | null} error - A general error message.
 * @property {Object<string, string[]> | null} errors - Field-specific error messages.
 * @property {boolean | undefined} success - Indicates if the operation was successful.
 */
export async function createIssueReport(prevState, formData) {
  // Reset action state if no form data is provided
  if (!formData) {
    return {
      message: null,
      error: null,
      errors: null,
      success: null,
    };
  }

  const freelancer = await getFreelancer();

  try {
    const rawFormData = {
      issueType: formData.get('issueType'),
      description: formData.get('description'),
      currentUrl: formData.get('currentUrl'), // Get currentUrl
    };

    const validationResult = ReportSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const fieldErrors = {};

      validationResult.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = fieldErrors[err.path[0]] || [];
          fieldErrors[err.path[0]].push(err.message);
        }
      });

      return {
        message: 'Η φόρμα περιέχει σφάλματα.',
        error: 'Validation failed',
        errors: fieldErrors,
      };
    }

    const {
      issueType: issueTypeId,
      description,
      currentUrl,
    } = validationResult.data; // Destructure currentUrl

    const issueTypeLabel = issueOptionsMap[issueTypeId] || issueTypeId;

    // Create email message with HTML formatting for better email client support
    let emailMessage = `<strong>${issueTypeLabel}:</strong><br><br>${description.replace(
      /\n/g,
      '<br>',
    )}<br><br>`;

    if (freelancer && freelancer.id) {
      const freelancerEmail = freelancer.email || freelancer.email || 'N/A';

      const freelancerUsername = freelancer.username || 'N/A';

      const freelancerDisplayName =
        freelancer.displayName || freelancerUsername;

      emailMessage += `<strong>Χρήστης:</strong><br>`;
      emailMessage += `email: ${freelancerEmail}<br>`;
      emailMessage += `username: ${freelancerUsername}<br>`;
      emailMessage += `displayName: ${freelancerDisplayName}<br>`;
      emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::freelancer.freelancer/${freelancer.id}" target="_blank">Προβολή στο Strapi</a><br><br>`;

      if (currentUrl) {
        emailMessage += `<strong>Στην σελίδα:</strong> <a href="${currentUrl}" target="_blank">${currentUrl}</a><br><br>`;
      }
    }

    const mutationVariables = {
      data: {
        name: freelancer.displayName,
        email: freelancer.email,
        message: emailMessage,
      },
    };

    const result = await postData(CONTACT, mutationVariables);

    if (result.error) {
      return {
        message: null,
        error: result.error || 'Προέκυψε σφάλμα κατά την υποβολή της αναφοράς.',
        errors: result.errors || null,
      };
    }

    if (result.data?.createEmail?.data?.id) {
      return {
        message: 'Η αναφορά υποβλήθηκε με επιτυχία!',
        error: null,
        errors: null,
        success: true,
      };
    } else {
      return {
        message: null,
        error: 'Η υποβολή της αναφοράς απέτυχε. Παρακαλώ δοκιμάστε ξανά.',
        errors: null,
      };
    }
  } catch (error) {
    return {
      message: null,
      error:
        'Προέκυψε ένα μη αναμενόμενο σφάλμα κατά την επεξεργασία της αναφοράς.',
      errors: null,
    };
  }
}
