'use server';

import { postData } from '@/lib/client/operations';
import { CONTACT } from '@/lib/graphql';

import { freelancerReportSchema } from '@/lib/validations';

/**
 * @async
 * @function createFreelancerReport
 * @description Server action to handle the creation of a freelancer profile report.
 * It validates form data, constructs an HTML email, and sends it via GraphQL.
 */
export async function createFreelancerReport(prevState, formData) {
  if (!formData) {
    return {
      message: null,
      error: null,
      errors: null,
      success: null,
    };
  }
  try {
    const rawDescription = formData.get('description');

    const rawCurrentUrl = formData.get('currentUrl');

    const rawReporterString = formData.get('reporter');

    const rawReportedString = formData.get('reported');

    let parsedReporter, parsedReported;

    try {
      parsedReporter = JSON.parse(rawReporterString);
      parsedReported = JSON.parse(rawReportedString);
    } catch (e) {
      return {
        message: 'Σφάλμα στην επεξεργασία των δεδομένων της φόρμας.',
        error: 'Invalid JSON data.',
        errors: null,
        success: false,
      };
    }

    const normalizeOptionalFields = (obj) => {
      if (obj) {
        for (const key of ['email', 'displayName', 'username']) {
          if (obj[key] === '') {
            obj[key] = undefined;
          }
        }
      }

      return obj;
    };

    const dataToValidate = {
      description: rawDescription,
      currentUrl: rawCurrentUrl,
      reporter: normalizeOptionalFields(parsedReporter),
      reported: normalizeOptionalFields(parsedReported),
    };

    const validationResult = freelancerReportSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const fieldErrors = {};

      validationResult.error.errors.forEach((err) => {
        const pathKey = err.path.join('.');

        fieldErrors[pathKey] = fieldErrors[pathKey] || [];
        fieldErrors[pathKey].push(err.message);
      });

      return {
        message: 'Η φόρμα περιέχει σφάλματα.',
        error: 'Validation failed',
        errors: fieldErrors,
        success: false,
      };
    }

    const { description, currentUrl, reporter, reported } =
      validationResult.data;

    let emailMessage = `<strong>Αναφορά Προφίλ Freelancer</strong><br><br>`;

    emailMessage += `<strong>Περιγραφή Ζητήματος:</strong><br>${description.replace(
      /\n/g,
      '<br>',
    )}<br><br>`;
    emailMessage += `<strong>Αναφορά για το προφίλ:</strong><br>`;
    emailMessage += `ID: ${reported.id}<br>`;
    if (reported.displayName)
      emailMessage += `Όνομα: ${reported.displayName}<br>`;
    if (reported.email) emailMessage += `Email: ${reported.email}<br>`;
    if (reported.username) emailMessage += `Username: ${reported.username}<br>`;
    emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::freelancer.freelancer/${reported.id}" target="_blank">Προβολή Αναφερόμενου στο Strapi</a><br><br>`;
    emailMessage += `<strong>Υποβολή αναφοράς από:</strong><br>`;
    emailMessage += `ID: ${reporter.id}<br>`;
    if (reporter.displayName)
      emailMessage += `Όνομα: ${reporter.displayName}<br>`;
    if (reporter.email) emailMessage += `Email: ${reporter.email}<br>`;
    if (reporter.username) emailMessage += `Username: ${reporter.username}<br>`;
    emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::freelancer.freelancer/${reporter.id}" target="_blank">Προβολή Αναφέροντα στο Strapi</a><br><br>`;
    emailMessage += `<strong>Η αναφορά υποβλήθηκε από τη σελίδα:</strong> <a href="${currentUrl}" target="_blank">${currentUrl}</a><br><br>`;

    const mutationVariables = {
      data: {
        name: reporter.displayName,
        email: reporter.email,
        message: emailMessage,
        subject: 'Λάβαμε την αναφορά σου!',
        adminSubject: `Νέα Αναφορά Προφίλ! - ${reporter.email}`,
        title: `Λάβαμε την αναφορά σου ${reporter.displayName}!`,
        adminTitle: 'Νέα Φόρμα Αναφοράς Προφίλ',
      },
    };

    const result = await postData(CONTACT, mutationVariables);

    if (result.error) {
      return {
        message: null,
        error: result.error || 'Προέκυψε σφάλμα κατά την υποβολή της αναφοράς.',
        errors: result.errors || null,
        success: false,
      };
    }
    if (result.data?.createEmail?.data?.id) {
      return {
        message: 'Η αναφορά προφίλ υποβλήθηκε με επιτυχία!',
        error: null,
        errors: null,
        success: true,
      };
    } else {
      const strapiError =
        result.data?.createEmail?.error?.message ||
        'Η υποβολή της αναφοράς προφίλ απέτυχε. Παρακαλώ δοκιμάστε ξανά.';

      return {
        message: null,
        error: strapiError,
        errors: null,
        success: false,
      };
    }
  } catch (error) {
    return {
      message: null,
      error:
        'Προέκυψε ένα μη αναμενόμενο σφάλμα κατά την επεξεργασία της αναφοράς προφίλ.',
      errors: null,
      success: false,
    };
  }
}
