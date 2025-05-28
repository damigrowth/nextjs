import { z } from 'zod';

export const additionalInfoSchema = z.object({
  size: z
    .object({
      data: z
        .object({
          id: z.string(),
        })
        .nullable(),
    })
    .optional()
    .nullable(),
  terms: z
    .string()
    // .min(80, "Οι όροι συνεργασίας πρέπει να είναι τουλάχιστον 80 χαρακτήρες")
    // .max(
    //   5000,
    //   "Οι όροι συνεργασίας δεν μπορούν να υπερβαίνουν τους 5000 χαρακτήρες"
    // )
    .optional()
    .nullable(),
  minBudget: z.string().optional().nullable(),
  industries: z
    .array(z.string())
    .max(10, 'Μπορείτε να επιλέξετε έως 3 κλάδους')
    .optional()
    .nullable(),
  contactTypes: z.array(z.string()).optional().nullable(),
  payment_methods: z.array(z.string()).optional().nullable(),
  settlement_methods: z.array(z.string()).optional().nullable(),
  // Added rate and commencement
  rate: z.number().min(10).max(50000).optional().nullable(),
  commencement: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .nullable(),
});
