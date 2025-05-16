"use server";

import { z } from "zod";
import { CONTACT } from "@/lib/graphql/mutations";
import { postData } from "@/lib/client/operations";

/**
 * @constant {z.ZodObject} ServiceReportSchema
 * @description Zod schema for validating the service report form data.
 * @property {z.ZodString} description - The report description. Must be between 1 and 1000 characters.
 * @property {z.ZodString} currentUrl - The URL from which the report was submitted. Must be a valid URL.
 * @property {z.ZodString} serviceId - The ID of the service being reported. Must not be empty.
 * @property {z.ZodString} title - The title of the service being reported. Must not be empty.
 * @property {z.ZodOptional<z.ZodString>} fid - The ID of the freelancer associated with the service (optional).
 * @property {z.ZodOptional<z.ZodString>} email - The email of the freelancer (optional, must be valid if provided).
 * @property {z.ZodOptional<z.ZodString>} displayName - The display name of the freelancer (optional).
 */
const ServiceReportSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Η περιγραφή είναι υποχρεωτική." })
    .max(1000, {
      message: "Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες.",
    }),
  currentUrl: z.string().url({ message: "Μη έγκυρο URL." }),
  serviceId: z.string().min(1, { message: "Service ID είναι υποχρεωτικό." }),
  title: z.string().min(1, { message: "Service title είναι υποχρεωτικό." }),
  fid: z.string().optional(),
  email: z
    .string()
    .email({ message: "Μη έγκυρο email αναφερόμενου freelancer." })
    .optional(),
  displayName: z.string().optional(),
});

/**
 * @async
 * @function createServiceReport
 * @description Server action to handle the creation of a service report.
 * It validates the incoming form data using `ServiceReportSchema`,
 * constructs an HTML email message with the report details,
 * and sends this information via a GraphQL mutation (`CONTACT`).
 * If `formData` is not provided, it returns an initial state (useful for resetting the form action state).
 * @param {object | null} prevState - The previous state of the form action. Contains properties like `message`, `error`, `errors`, `success`.
 * @param {FormData | undefined} formData - The form data submitted by the user. If undefined or null, the action resets its state.
 * @returns {Promise<object>} An object representing the outcome of the action.
 * It includes:
 * - `message` (string|null): A general message (e.g., success or validation summary).
 * - `error` (string|null): An error message if an issue occurred.
 * - `errors` (object|null): Field-specific validation errors.
 * - `success` (boolean|null): True if the report was submitted successfully.
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
    const rawFormData = {
      description: formData.get("description"),
      currentUrl: formData.get("currentUrl"),
      serviceId: formData.get("serviceId"),
      title: formData.get("title"),
      fid: formData.get("fid"),
      email: formData.get("email"),
      displayName: formData.get("displayName"),
    };

    if (rawFormData.fid === "") rawFormData.fid = undefined;

    const validationResult = ServiceReportSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path.length > 0) {
          fieldErrors[err.path[0]] = fieldErrors[err.path[0]] || [];
          fieldErrors[err.path[0]].push(err.message);
        }
      });
      return {
        message: "Η φόρμα περιέχει σφάλματα.",
        error: "Validation failed",
        errors: fieldErrors,
      };
    }

    const {
      description,
      currentUrl,
      serviceId,
      title,
      fid,
      email,
      displayName,
    } = validationResult.data;

    let emailMessage = `<strong>Αναφορά Υπηρεσίας:</strong> ${title}<br><br>`;
    emailMessage += `<strong>Περιγραφή Ζητήματος:</strong><br>${description.replace(
      /\n/g,
      "<br>"
    )}<br><br>`;

    emailMessage += `<strong>Υπηρεσία:</strong><br>`;
    emailMessage += `Τίτλος: ${title}<br>`;
    emailMessage += `ID: ${serviceId}<br>`;
    emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::service.service/${serviceId}" target="_blank">Προβολή Υπηρεσίας στο Strapi</a><br><br>`;
    emailMessage += `<strong>Freelancer:</strong><br>`;
    emailMessage += `ID: ${fid}<br>`;
    emailMessage += `Όνομα: ${displayName}<br>`;
    emailMessage += `Email: ${email}<br>`;
    emailMessage += `<a href="https://api.doulitsa.gr/admin/content-manager/collection-types/api::freelancer.freelancer/${fid}" target="_blank">Προβολή Freelancer στο Strapi</a><br><br>`;

    emailMessage += `<strong>Η αναφορά υποβλήθηκε από τη σελίδα:</strong> <a href="${currentUrl}" target="_blank">${currentUrl}</a><br><br>`;

    const mutationVariables = {
      data: {
        name: displayName,
        email: email,
        message: emailMessage,
      },
    };

    const result = await postData(CONTACT, mutationVariables);

    if (result.error) {
      return {
        message: null,
        error: result.error || "Προέκυψε σφάλμα κατά την υποβολή της αναφοράς.",
        errors: result.errors || null,
      };
    }

    if (result.data?.createEmail?.data?.id) {
      return {
        message: "Η αναφορά υποβλήθηκε με επιτυχία!",
        error: null,
        errors: null,
        success: true,
      };
    } else {
      const strapiError =
        result.data?.createEmail?.error?.message ||
        "Η υποβολή της αναφοράς απέτυχε. Παρακαλώ δοκιμάστε ξανά.";
      return {
        message: null,
        error: strapiError,
        errors: null,
      };
    }
  } catch (error) {
    return {
      message: null,
      error:
        "Προέκυψε ένα μη αναμενόμενο σφάλμα κατά την επεξεργασία της αναφοράς.",
      errors: null,
    };
  }
}
