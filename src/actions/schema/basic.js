import { z } from 'zod';
import { SUPPORTED_FORMATS } from '@/utils/media-validation';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const ACCEPTED_IMAGE_TYPES = SUPPORTED_FORMATS.profileImage.mimeTypes;

const MIN_WIDTH = 80;

const MIN_HEIGHT = 80;

export const imageSchema = z
  .union([
    // Case 1: Existing valid image
    z.object({
      data: z.object({
        id: z.string(),
        attributes: z.object({
          url: z.string().url(),
          formats: z
            .object({
              thumbnail: z
                .object({
                  url: z.string().url(),
                })
                .optional(),
            })
            .optional(),
        }),
      }),
    }),
    // Case 2: New file upload (modified to work in Node.js)
    z
      .object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        lastModified: z.number(),
      })
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        'Το μέγεθος του αρχείου πρέπει να είναι μικρότερο από 3MB',
      )
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        `Επιτρέπονται μόνο αρχεία ${SUPPORTED_FORMATS.profileImage.displayFormats.join(', ')}`,
      )
      .optional(),
    // Case 3: Empty/undefined
    z.undefined().or(z.null()).optional(),
  ])
  .superRefine((val, ctx) => {
    // Check if we have either existing image or valid file object
    const hasValidImage =
      val?.data?.attributes?.url ||
      (val?.name && val?.size && val?.type && val?.lastModified);

    if (!hasValidImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Η εικόνα προφίλ είναι υποχρεωτική',
      });
    }
  });

export const coverageSchema = z
  .object({
    online: z.boolean(),
    onbase: z.boolean(),
    onsite: z.boolean(),
    address: z.string().nullable(),
    area: z.object({ data: z.any().nullable() }).nullable(),
    county: z.object({ data: z.any().nullable() }).nullable(),
    zipcode: z.object({ data: z.any().nullable() }).nullable(),
    counties: z.object({ data: z.array(z.any()).nullable() }).nullable(),
    areas: z.object({ data: z.array(z.any()).nullable() }).nullable(),
  })
  .superRefine((cov, ctx) => {
    // At least one coverage type must be selected
    if (!cov.online && !cov.onbase && !cov.onsite) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Πρέπει να επιλέξετε τουλάχιστον έναν τρόπο κάλυψης',
        path: ['coverage'],
      });
    }
    // Validate onbase requirements
    if (cov.onbase) {
      if (!cov.address?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Η διεύθυνση είναι υποχρεωτική για κάλυψη στον χώρο σας',
          path: ['address'],
        });
      }
      if (!cov.zipcode?.data?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ο Τ.Κ. είναι υποχρεωτικός για κάλυψη στον χώρο σας',
          path: ['zipcode'],
        });
      }
      if (!cov.county?.data?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ο νομός είναι υποχρεωτικός για κάλυψη στον χώρο σας',
          path: ['county'],
        });
      }
      if (!cov.area?.data?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Η περιοχή είναι υποχρεωτική για κάλυψη στον χώρο σας',
          path: ['area'],
        });
      }
    }
    // Validate onsite requirements
    if (cov.onsite) {
      if (!cov.counties?.data?.length && !cov.areas?.data?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Απαιτείται τουλάχιστον ένας νομός ή μια περιοχή για κάλυψη στον χώρο του πελάτη',
          path: ['counties'],
        });
      }
    }
  });

export const basicInfoSchema = z.object({
  image: imageSchema.optional(),
  category: z.object({
    data: z.object({
      id: z.string(),
      attributes: z.object({ slug: z.string() }),
    }),
  }),
  subcategory: z.object({
    data: z.object({
      id: z.string(),
      attributes: z.object({ slug: z.string() }),
    }),
  }),
  coverage: coverageSchema, // Defined above
  // Optional fields
  tagline: z.string().min(5).max(120).optional().nullable().or(z.literal('')),
  description: z
    .string()
    .min(80)
    .max(5000)
    .optional()
    .nullable()
    .or(z.literal('')),
});
