import { z } from 'zod';

import { coverageSchema, imageSchema } from './basic';

// Define the base schema for onboarding fields
export const OnboardingFormSchema = z.object({
  image: imageSchema.optional(), // Use the imported imageSchema and make it optional
  category: z.object({
    data: z.object({
      id: z.string(), // Changed to z.string() as in basic.js
      attributes: z.object({ slug: z.string() }),
    }),
  }),
  subcategory: z.object({
    data: z.object({
      id: z.string(), // Changed to z.string() as in basic.js
      attributes: z.object({ slug: z.string() }),
    }),
  }),
  description: z
    .string()
    .min(80, 'Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες.')
    .max(5000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες.')
    .optional()
    .nullable() // Added nullable as in basic.js
    .or(z.literal('')),
  coverage: coverageSchema, // Use the imported coverageSchema
  portfolio: z.array(z.any()).optional(), // Use the portfolio schema from presentation.js
});

// Schema for validation when new media files are involved
export const OnboardingFormSchemaWithMedia = OnboardingFormSchema.extend({
  hasNewMedia: z.boolean().optional(),
  hasDeletedMedia: z.boolean().optional(),
  mediaCount: z.number().optional(),
});
