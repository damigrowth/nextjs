'use server';

import { postData } from '@/lib/client/operations';
import { CONTACT } from '@/lib/graphql';

import { serviceReportSchema } from '@/lib/validations';

/**
 * @async
 * @function createServiceReport
 * @param {object | null} prevState - The previous state of the form action.
 *   Typically contains `message`, `error`, `errors`, `success` properties from the last action invocation.
 * @param {FormData | undefined} formData - The form data submitted by the user.
 *   Expected to contain `description`, `currentUrl`, and JSON stringified `reporter`, `reported`, `service` objects.
 *   If `undefined` or `null`, the action resets its state.
 * @returns {Promise<object>} An object representing the outcome of the action.
 *   This object includes:
 *   - `message` (string | null): A general message (e.g., success confirmation or validation summary).
 *   - `error` (string | null): An error message if a server-side issue or GraphQL error occurred.
 *   - `errors` (object | null): An object mapping field paths (e.g., "description", "reporter.email") to an array of
 *     validation error messages for that field. Null if no validation errors.
 *   - `success` (boolean | null): True if the report was submitted and processed successfully, false otherwise.
 *     Null if `formData` was not provided.
 */
export async function createServiceReport(prevState, formData) {
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

    const rawServiceString = formData.get('service');

    let parsedReporter, parsedReported, parsedService;

    try {
      parsedReporter = JSON.parse(rawReporterString);
      parsedReported = JSON.parse(rawReportedString);
      parsedService = JSON.parse(rawServiceString);
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
      service: parsedService,
    };

    const validationResult = serviceReportSchema.safeParse(dataToValidate);

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

    const { description, currentUrl, reporter, reported, service } =
      validationResult.data;

    let emailMessage = ``;

    emailMessage += `<strong>Περιγραφή Ζητήματος:</strong><br>${description.replace(
      /\n/g,
      '<br>',
    )}<br><br>`;
    emailMessage += `<strong>Υπηρεσία:</strong><br>`;
    emailMessage += `Τίτλος: ${service.title}<br>`;
    emailMessage += `ID: ${service.id}<br>`;
    emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::service.service/${service.id}" target="_blank">Προβολή Υπηρεσίας στο Strapi</a><br><br>`;
    emailMessage += `<strong>Προς:</strong><br>`;
    emailMessage += `ID: ${reported.id}<br>`;
    if (reported.displayName)
      emailMessage += `Όνομα: ${reported.displayName}<br>`;
    if (reported.email) emailMessage += `Email: ${reported.email}<br>`;
    if (reported.username) emailMessage += `Username: ${reported.username}<br>`;
    emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::freelancer.freelancer/${reported.id}" target="_blank">Προβολή Προφίλ στο Strapi</a><br><br>`;
    emailMessage += `<strong>Από:</strong><br>`;
    emailMessage += `ID: ${reporter.id}<br>`;
    if (reporter.displayName)
      emailMessage += `Όνομα: ${reporter.displayName}<br>`;
    if (reporter.email) emailMessage += `Email: ${reporter.email}<br>`;
    if (reporter.username) emailMessage += `Username: ${reporter.username}<br>`;
    emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::freelancer.freelancer/${reporter.id}" target="_blank">Προβολή Προφίλ στο Strapi</a><br><br>`;
    emailMessage += `<strong>Η αναφορά υποβλήθηκε από τη σελίδα:</strong> <a href="${currentUrl}" target="_blank">${currentUrl}</a><br><br>`;

    const mutationVariables = {
      data: {
        name: reporter.displayName,
        email: reporter.email,
        message: emailMessage,
        subject: `Λάβαμε την αναφορά σου!`,
        adminSubject: `Νέα Αναφορά Υπηρεσίας! - ${reporter.email}`,
        title: `Λάβαμε την αναφορά σου ${reporter.displayName}!`,
        adminTitle: `Νέα Αναφορά Υπηρεσίας!`,
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
        message: 'Η αναφορά υπηρεσίας υποβλήθηκε με επιτυχία!',
        error: null,
        errors: null,
        success: true,
      };
    } else {
      const strapiError =
        result.data?.createEmail?.error?.message ||
        'Η υποβολή της αναφοράς υπηρεσίας απέτυχε. Παρακαλώ δοκιμάστε ξανά.';

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
        'Προέκυψε ένα μη αναμενόμενο σφάλμα κατά την επεξεργασία της αναφοράς υπηρεσίας.',
      errors: null,
      success: false,
    };
  }
}
