"use server";

import { z } from "zod";
import { CONTACT } from "@/lib/graphql/mutations";
import { postData } from "@/lib/client/operations";

/**
 * @constant {z.ZodObject} ReporterSchema
 * @description Zod schema for the reporter object.
 */
const ReporterSchema = z.object({
  id: z.string().min(1, { message: "ID αναφέροντα είναι υποχρεωτικό." }),
  email: z
    .string()
    .email({ message: "Μη έγκυρο email αναφέροντα." })
    .optional()
    .or(z.literal("")),
  displayName: z.string().optional().or(z.literal("")),
  username: z.string().optional().or(z.literal("")),
});

/**
 * @constant {z.ZodObject} ReportedSchema
 * @description Zod schema for the reported freelancer object.
 */
const ReportedSchema = z.object({
  id: z
    .string()
    .min(1, { message: "ID αναφερόμενου freelancer είναι υποχρεωτικό." }),
  email: z
    .string()
    .email({ message: "Μη έγκυρο email αναφερόμενου." })
    .optional()
    .or(z.literal("")),
  displayName: z.string().optional().or(z.literal("")),
  username: z.string().optional().or(z.literal("")),
});

/**
 * @constant {z.ZodObject} ServiceSchema
 * @description Zod schema for the reported service object.
 */
const ServiceSchema = z.object({
  id: z.string().min(1, { message: "ID υπηρεσίας είναι υποχρεωτικό." }),
  title: z.string().min(1, { message: "Τίτλος υπηρεσίας είναι υποχρεωτικός." }),
});

/**
 * @constant {z.ZodObject} ServiceReportSchema
 * @description Zod schema for validating the service report form data.
 */
const ServiceReportSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Η περιγραφή είναι υποχρεωτική." })
    .max(1000, {
      message: "Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες.",
    }),
  currentUrl: z.string().url({ message: "Μη έγκυρο URL." }),
  reporter: ReporterSchema,
  reported: ReportedSchema,
  service: ServiceSchema,
});

/**
 * Server action to handle the creation of a service report.
 *
 * This function processes form data submitted for reporting a service. It performs the following steps:
 * 1. Retrieves and parses form data: `description`, `currentUrl`, `reporter` (JSON string),
 *    `reported` (freelancer, JSON string), and `service` (JSON string).
 * 2. Normalizes optional fields (email, displayName, username) in `reporter` and `reported` objects,
 *    converting empty strings to `undefined` for consistent validation.
 * 3. Validates the processed data against `ServiceReportSchema`. If validation fails,
 *    it returns an object with error messages and field-specific errors.
 * 4. If validation is successful, it constructs an HTML email message containing details of the report:
 *    - The service being reported (title, ID, link to Strapi).
 *    - The freelancer who owns the service (ID, display name, email, username, link to Strapi).
 *    - The user who submitted the report (ID, display name, email, username, link to Strapi).
 *    - The URL from which the report was submitted.
 * 5. Prepares mutation variables for a GraphQL `CONTACT` mutation, including:
 *    - Reporter's name and email.
 *    - The constructed HTML email message.
 *    - Subject lines for both the user and admin notifications.
 *    - Titles for both the user and admin notifications.
 * 6. Calls the `postData` utility to send the GraphQL mutation.
 * 7. Based on the mutation result:
 *    - If `postData` returns an error, or if the mutation itself indicates an error (e.g., `result.data.createEmail.error`),
 *      it returns an object with an error message.
 *    - If the mutation is successful (indicated by `result.data.createEmail.data.id`),
 *      it returns an object with a success message.
 * 8. Catches any unexpected errors during the process and returns a generic error message.
 *
 * If `formData` is not provided (e.g., on initial render or when resetting form action state),
 * it returns an initial state object with all properties set to `null` or `false`.
 *
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
    const rawDescription = formData.get("description");

    const rawCurrentUrl = formData.get("currentUrl");

    const rawReporterString = formData.get("reporter");

    const rawReportedString = formData.get("reported");

    const rawServiceString = formData.get("service");

    let parsedReporter, parsedReported, parsedService;

    try {
      parsedReporter = JSON.parse(rawReporterString);
      parsedReported = JSON.parse(rawReportedString);
      parsedService = JSON.parse(rawServiceString);
    } catch (e) {
      return {
        message: "Σφάλμα στην επεξεργασία των δεδομένων της φόρμας.",
        error: "Invalid JSON data.",
        errors: null,
        success: false,
      };
    }

    const normalizeOptionalFields = (obj) => {
      if (obj) {
        for (const key of ["email", "displayName", "username"]) {
          if (obj[key] === "") {
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

    const validationResult = ServiceReportSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.errors.forEach((err) => {
        const pathKey = err.path.join(".");
        fieldErrors[pathKey] = fieldErrors[pathKey] || [];
        fieldErrors[pathKey].push(err.message);
      });
      return {
        message: "Η φόρμα περιέχει σφάλματα.",
        error: "Validation failed",
        errors: fieldErrors,
        success: false,
      };
    }

    const { description, currentUrl, reporter, reported, service } =
      validationResult.data;

    let emailMessage = ``;
    emailMessage += `<strong>Περιγραφή Ζητήματος:</strong><br>${description.replace(
      /\n/g,
      "<br>"
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
        error: result.error || "Προέκυψε σφάλμα κατά την υποβολή της αναφοράς.",
        errors: result.errors || null,
        success: false,
      };
    }

    if (result.data?.createEmail?.data?.id) {
      return {
        message: "Η αναφορά υπηρεσίας υποβλήθηκε με επιτυχία!",
        error: null,
        errors: null,
        success: true,
      };
    } else {
      const strapiError =
        result.data?.createEmail?.error?.message ||
        "Η υποβολή της αναφοράς υπηρεσίας απέτυχε. Παρακαλώ δοκιμάστε ξανά.";
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
        "Προέκυψε ένα μη αναμενόμενο σφάλμα κατά την επεξεργασία της αναφοράς υπηρεσίας.",
      errors: null,
      success: false,
    };
  }
}
