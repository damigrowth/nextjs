import { z } from 'zod';

export const billingSchemaOptional = z.object({
  receipt: z.boolean(),
  invoice: z.boolean(),
  afm: z
    .number()
    .refine((val) => val !== null && val.toString().length === 9, {
      message: 'Το ΑΦΜ πρέπει να έχει ακριβώς 9 ψηφία',
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Το ΑΦΜ είναι υποχρεωτικό',
    }),
  doy: z.string().min(2, 'Το ΔΟΥ είναι υποχρεωτικό').optional().nullable(),
  brandName: z
    .string()
    .min(2, 'Η επωνυμία είναι υποχρεωτική')
    .optional()
    .nullable(),
  profession: z
    .string()
    .min(2, 'Το επάγγελμα είναι υποχρεωτικό')
    .optional()
    .nullable(),
  address: z
    .string()
    .min(2, 'Η διεύθυνση είναι υποχρεωτική')
    .optional()
    .nullable(),
});

export const billingSchema = z.object({
  receipt: z.boolean(),
  invoice: z.boolean(),
  afm: z
    .number()
    .refine((val) => val !== null && val.toString().length === 9, {
      message: 'Το ΑΦΜ πρέπει να έχει ακριβώς 9 ψηφία',
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Το ΑΦΜ είναι υποχρεωτικό',
    }),
  doy: z
    .string()
    .min(2, 'Το ΔΟΥ είναι υποχρεωτικό')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Το ΔΟΥ είναι υποχρεωτικό',
    }),
  brandName: z
    .string()
    .min(2, 'Η επωνυμία είναι υποχρεωτική')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Η επωνυμία είναι υποχρεωτική',
    }),
  profession: z
    .string()
    .min(2, 'Το επάγγελμα είναι υποχρεωτικό')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Το επάγγελμα είναι υποχρεωτικό',
    }),
  address: z
    .string()
    .min(2, 'Η διεύθυνση είναι υποχρεωτική')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Η διεύθυνση είναι υποχρεωτική',
    }),
});
