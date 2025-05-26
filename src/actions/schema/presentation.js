import { z } from 'zod';

export const presentationSchema = z.object({
  website: z
    .string()
    .url('Εισάγετε έναν έγκυρο ιστότοπο')
    .optional()
    .nullable()
    .or(z.literal('')),
  socials: z.object({
    facebook: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο Facebook')
            .regex(
              /^https?:\/\/(www\.)?facebook\.com\/.*$/,
              'Μη έγκυρος σύνδεσμος Facebook',
            )
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
    linkedin: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο LinkedIn')
            .regex(
              /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
              'Μη έγκυρος σύνδεσμος LinkedIn',
            )
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
    x: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο X')
            .regex(/^https?:\/\/(www\.)?x\.com\/.*$/, 'Μη έγκυρος σύνδεσμος X')
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
    youtube: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο YouTube')
            .regex(
              /^https?:\/\/(www\.)?youtube\.com\/.*$/,
              'Μη έγκυρος σύνδεσμος YouTube',
            )
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
    github: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο GitHub')
            .regex(
              /^https?:\/\/(www\.)?github\.com\/.*$/,
              'Μη έγκυρος σύνδεσμος GitHub',
            )
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
    instagram: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο Instagram')
            .regex(
              /^https?:\/\/(www\.)?instagram\.com\/.*$/,
              'Μη έγκυρος σύνδεσμος Instagram',
            )
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
    behance: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο Behance')
            .regex(
              /^https?:\/\/(www\.)?behance\.net\/.*$/,
              'Μη έγκυρος σύνδεσμος Behance',
            )
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
    dribbble: z
      .union([
        z.null(),
        z.object({
          url: z
            .string()
            .url('Εισάγετε έναν έγκυρο σύνδεσμο Dribbble')
            .regex(
              /^https?:\/\/(www\.)?dribbble\.com\/.*$/,
              'Μη έγκυρος σύνδεσμος Dribbble',
            )
            .optional()
            .nullable()
            .or(z.literal('')),
        }),
      ])
      .optional()
      .nullable(),
  }),
  viber: z.string().optional().nullable().or(z.literal('')), // Add viber
  whatsapp: z.string().optional().nullable().or(z.literal('')), // Add whatsapp
  visibility: z.object({
    email: z.boolean(),
    phone: z.boolean(),
    address: z.boolean(),
  }),
  portfolio: z.array(z.any()).optional(),
  // Added phone validation
  phone: z
    .number()
    .min(1000000000, 'Ο αριθμός τηλεφώνου πρέπει να έχει 10-12 ψηφία')
    .max(999999999999, 'Ο αριθμός τηλεφώνου πρέπει να έχει 10-12 ψηφία')
    .optional()
    .nullable(),
});
