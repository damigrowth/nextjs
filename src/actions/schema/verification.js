import { z } from 'zod';

export const verificationFormSchema = z.object({
  afm: z.string().min(2, 'Το ΑΦΜ είναι υποχρεωτικό'),
  brandName: z
    .string()
    .min(2, 'Η επωνυμία είναι υποχρεωτική')
    .optional()
    .nullable(),
  address: z
    .string()
    .min(2, 'Η διεύθυνση είναι υποχρεωτική')
    .optional()
    .nullable(),
  phone: z.coerce // Add coerce here
    .number()
    .min(1000000000, 'Ο αριθμός τηλεφώνου πρέπει να έχει 10-12 ψηφία')
    .max(999999999999, 'Ο αριθμός τηλεφώνου πρέπει να έχει 10-12 ψηφία')
    .optional()
    .nullable(),
});
