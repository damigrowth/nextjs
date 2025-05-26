const { z } = require('zod');

/**
 * @constant {z.ZodObject} ReporterSchema
 * @description Zod schema for the reporter object.
 */
const ReporterSchema = z.object({
  id: z.string().min(1, { message: 'ID αναφέροντα είναι υποχρεωτικό.' }),
  email: z
    .string()
    .email({ message: 'Μη έγκυρο email αναφέροντα.' })
    .optional()
    .or(z.literal('')),
  displayName: z.string().optional().or(z.literal('')),
  username: z.string().optional().or(z.literal('')),
});

/**
 * @constant {z.ZodObject} ReportedSchema
 * @description Zod schema for the reported freelancer object.
 */
const ReportedSchema = z.object({
  id: z
    .string()
    .min(1, { message: 'ID αναφερόμενου freelancer είναι υποχρεωτικό.' }),
  email: z
    .string()
    .email({ message: 'Μη έγκυρο email αναφερόμενου.' })
    .optional()
    .or(z.literal('')),
  displayName: z.string().optional().or(z.literal('')),
  username: z.string().optional().or(z.literal('')),
});

/**
 * @constant {z.ZodObject} FreelancerReportSchema
 * @description Zod schema for validating the freelancer report form data.
 */
export const FreelancerReportSchema = z.object({
  description: z
    .string()
    .min(1, { message: 'Η περιγραφή είναι υποχρεωτική.' })
    .max(1000, {
      message: 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες.',
    }),
  currentUrl: z.string().url({ message: 'Μη έγκυρο URL.' }),
  reporter: ReporterSchema,
  reported: ReportedSchema,
});

/**
 * @constant {z.ZodObject} ServiceSchema
 * @description Zod schema for the reported service object.
 */
export const ServiceSchema = z.object({
  id: z.string().min(1, { message: 'ID υπηρεσίας είναι υποχρεωτικό.' }),
  title: z.string().min(1, { message: 'Τίτλος υπηρεσίας είναι υποχρεωτικός.' }),
});

/**
 * @constant {z.ZodObject} ServiceReportSchema
 * @description Zod schema for validating the service report form data.
 */
export const ServiceReportSchema = z.object({
  description: z
    .string()
    .min(1, { message: 'Η περιγραφή είναι υποχρεωτική.' })
    .max(1000, {
      message: 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες.',
    }),
  currentUrl: z.string().url({ message: 'Μη έγκυρο URL.' }),
  reporter: ReporterSchema,
  reported: ReportedSchema,
  service: ServiceSchema,
});

/**
 * Zod schema for validating the report issue form data.
 */
export const ReportSchema = z.object({
  issueType: z
    .string()
    .min(1, { message: 'Παρακαλώ επιλέξτε είδος ζητήματος.' }),
  description: z
    .string()
    .min(1, { message: 'Η περιγραφή είναι υποχρεωτική.' })
    .max(1000, {
      message: 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες.',
    }),
  currentUrl: z.string().url({ message: 'Μη έγκυρο URL.' }).optional(), // Added currentUrl
});
