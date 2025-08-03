/**
 * PROFILE VALIDATION SCHEMAS
 * Professional profile validation schemas
 */

import { z } from 'zod';
import {
  phoneSchema,
  urlSchema,
  paginationSchema,
  fileUploadSchema,
} from './shared';

// =============================================
// PROFILE CRUD SCHEMAS
// =============================================

export const createProfileSchema = z.object({
  // Profile professional fields
  type: z.string().min(1, 'Type is required').optional(),
  tagline: z
    .string()
    .max(100, 'Tagline must be less than 100 characters')
    .optional(),
  description: z
    .string()
    .min(80, 'Description must be at least 80 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  website: urlSchema.optional(),
  experience: z.number().int().min(0).optional(),
  rate: z.number().int().min(0).optional(),
  size: z.string().optional(),
  skills: z
    .array(z.string().min(1, 'Skill ID is required'))
    .max(10, 'Μπορείτε να επιλέξετε έως 10 δεξιότητες')
    .optional(),

  // Personal information
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional(),
  displayName: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: phoneSchema,
  city: z.string().optional(),
  county: z.string().optional(),
  zipcode: z.string().optional(),

  // Status fields
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  isActive: z.boolean().default(false),
});

export const updateProfileBasicInfoActionSchema = createProfileSchema.partial();

export const profileQuerySchema = z
  .object({
    search: z.string().optional(),
    type: z.string().optional(),
    verified: z.coerce.boolean().optional(),
    featured: z.coerce.boolean().optional(),
    published: z.coerce.boolean().optional(),
    minRate: z.coerce.number().min(0).optional(),
    maxRate: z.coerce.number().min(0).optional(),
    city: z.string().optional(),
    county: z.string().optional(),
  })
  .merge(paginationSchema);

// =============================================
// PROFILE IMAGE SCHEMAS
// =============================================

export const profileImageSchema = z
  .union([
    // Existing valid image from CMS
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
    // New file upload
    fileUploadSchema,
    // Empty/undefined
    z.undefined(),
    z.null(),
  ])
  .optional();

// Coverage/Location validation for professionals
export const coverageSchema = z.object({
  online: z.boolean(),
  onbase: z.boolean(),
  onsite: z.boolean(),
  address: z.string().optional(),
  area: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  county: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  zipcode: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  counties: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  areas: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        county: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .optional(),
      }),
    )
    .optional(),
});

// =============================================
// BASIC PROFILE INFO SCHEMA
// =============================================

export const basicProfileInfoSchema = z.object({
  image: profileImageSchema,
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
  coverage: coverageSchema,
  tagline: z.string().min(5).max(120).optional().nullable().or(z.literal('')),
  description: z
    .string()
    .min(80, 'Description must be at least 80 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .nullable(),
});

// =============================================
// ADDITIONAL PROFILE INFO SCHEMA
// =============================================

export const additionalProfileInfoSchema = z.object({
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
  terms: z.string().optional().nullable(),
  minBudget: z.string().optional().nullable(),
  industries: z
    .array(z.string())
    .max(10, 'You can select up to 10 industries')
    .optional()
    .nullable(),
  contactTypes: z.array(z.string()).optional().nullable(),
  payment_methods: z.array(z.string()).optional().nullable(),
  settlement_methods: z.array(z.string()).optional().nullable(),
  rate: z.number().min(10).max(50000).optional().nullable(),
  commencement: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .nullable(),
});

// =============================================
// SOCIAL MEDIA SCHEMA
// =============================================

export const socialMediaSchema = z.object({
  facebook: z
    .object({
      url: z
        .string()
        .url('Enter a valid Facebook link')
        .regex(
          /^https?:\/\/(www\.)?facebook\.com\/.*$/,
          'Invalid Facebook link',
        )
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
  linkedin: z
    .object({
      url: z
        .string()
        .url('Enter a valid LinkedIn link')
        .regex(
          /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
          'Invalid LinkedIn link',
        )
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
  x: z
    .object({
      url: z
        .string()
        .url('Enter a valid X link')
        .regex(/^https?:\/\/(www\.)?(twitter|x)\.com\/.*$/, 'Invalid X link')
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
  youtube: z
    .object({
      url: z
        .string()
        .url('Enter a valid YouTube link')
        .regex(/^https?:\/\/(www\.)?youtube\.com\/.*$/, 'Invalid YouTube link')
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
  github: z
    .object({
      url: z
        .string()
        .url('Enter a valid GitHub link')
        .regex(/^https?:\/\/(www\.)?github\.com\/.*$/, 'Invalid GitHub link')
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
  instagram: z
    .object({
      url: z
        .string()
        .url('Enter a valid Instagram link')
        .regex(
          /^https?:\/\/(www\.)?instagram\.com\/.*$/,
          'Invalid Instagram link',
        )
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
  behance: z
    .object({
      url: z
        .string()
        .url('Enter a valid Behance link')
        .regex(/^https?:\/\/(www\.)?behance\.net\/.*$/, 'Invalid Behance link')
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
  dribbble: z
    .object({
      url: z
        .string()
        .url('Enter a valid Dribbble link')
        .regex(
          /^https?:\/\/(www\.)?dribbble\.com\/.*$/,
          'Invalid Dribbble link',
        )
        .optional()
        .nullable()
        .or(z.literal('')),
    })
    .optional()
    .nullable(),
});

// =============================================
// PRESENTATION SCHEMA
// =============================================

export const presentationSchema = z.object({
  website: z
    .string()
    .url('Enter a valid website')
    .optional()
    .nullable()
    .or(z.literal('')),
  socials: socialMediaSchema.optional(),
  phone: z
    .string()
    .regex(/^\d{10,12}$/, 'Enter a valid phone number (10-12 digits)')
    .optional()
    .nullable()
    .or(z.literal('')),
  visibility: z
    .object({
      profile: z.boolean().default(true),
      socials: z.boolean().default(true),
      phone: z.boolean().default(true),
    })
    .optional(),
  portfolio: z.array(z.any()).optional().nullable(),
});

// =============================================
// BILLING SCHEMAS
// =============================================

export const billingOptionalSchema = z.object({
  receipt: z.boolean(),
  invoice: z.boolean(),
  afm: z
    .number()
    .refine((val) => val !== null && val.toString().length === 9, {
      message: 'Tax number must be exactly 9 digits',
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Tax number is required',
    }),
  doy: z.string().min(2, 'Tax office is required').optional().nullable(),
  brandName: z.string().min(2, 'Brand name is required').optional().nullable(),
  profession: z.string().min(2, 'Profession is required').optional().nullable(),
  address: z.string().min(2, 'Address is required').optional().nullable(),
});

export const billingSchema = z.object({
  receipt: z.boolean(),
  invoice: z.boolean(),
  afm: z
    .number()
    .refine((val) => val !== null && val.toString().length === 9, {
      message: 'Tax number must be exactly 9 digits',
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Tax number is required',
    }),
  doy: z
    .string()
    .min(2, 'Tax office is required')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Tax office is required',
    }),
  brandName: z
    .string()
    .min(2, 'Brand name is required')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Brand name is required',
    }),
  profession: z
    .string()
    .min(2, 'Profession is required')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Profession is required',
    }),
  address: z
    .string()
    .min(2, 'Address is required')
    .nullable()
    .refine((val) => val !== null, {
      message: 'Address is required',
    }),
});

// =============================================
// VERIFICATION SCHEMA
// =============================================

export const verificationFormSchema = z.object({
  afm: z.string().min(2, 'Tax number is required'),
  brandName: z.string().min(2, 'Brand name is required').optional().nullable(),
  address: z.string().min(2, 'Address is required').optional().nullable(),
  phone: z.coerce
    .number()
    .min(1000000000, 'Phone number must be 10-12 digits')
    .max(999999999999, 'Phone number must be 10-12 digits')
    .optional()
    .nullable(),
});

export const cloudinaryResourceSchema = z.object({
  public_id: z.string(),
  secure_url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  resource_type: z.enum(['image', 'video', 'raw']),
  format: z.string().optional(),
});

export const imageSchema = cloudinaryResourceSchema.nullable();

// Category/Subcategory selection for onboarding - now accepts ID strings
export const categorySchema = z.string().min(1, 'Κατηγορία είναι υποχρεωτική');

// Profile update schema for basic info form
export const profileBasicInfoUpdateSchema = z.object({
  image: z.any().nullable().optional(),
  tagline: z
    .string()
    .min(10, 'Το tagline πρέπει να έχει τουλάχιστον 10 χαρακτήρες')
    .max(100, 'Το tagline δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες')
    .optional(),
  bio: z
    .string()
    .min(80, 'Η περιγραφή πρέπει να έχει τουλάχιστον 80 χαρακτήρες')
    .max(5000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες'),
  category: z.string().min(1, 'Η κατηγορία είναι υποχρεωτική'),
  subcategory: z.string().min(1, 'Η υποκατηγορία είναι υποχρεωτική'),
  skills: z
    .array(z.string().min(1, 'Skill ID is required'))
    .min(1, 'Επιλέξτε τουλάχιστον μία δεξιότητα')
    .max(10, 'Μπορείτε να επιλέξετε έως 10 δεξιότητες')
    .optional(),
  speciality: z.string().min(1, 'Η ειδικότητα είναι υποχρεωτική').optional(),
  coverage: coverageSchema,
});

// Main onboarding form schema - bio, category, subcategory, coverage are required, image is optional for client validation
export const onboardingFormSchema = z.object({
  image: imageSchema, // Optional for client-side validation, required on server
  category: categorySchema, // Required - now a string slug
  subcategory: categorySchema, // Required - now a string slug
  bio: z
    .string() // Required - renamed from description
    .min(80, 'Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες.')
    .max(5000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες.'),
  coverage: coverageSchema, // Required
  portfolio: z.array(cloudinaryResourceSchema).optional(), // Optional - Cloudinary resources
});

// Extended onboarding schema with media handling
export const onboardingFormSchemaWithMedia = onboardingFormSchema.extend({
  hasNewMedia: z.boolean().optional(),
  hasDeletedMedia: z.boolean().optional(),
  mediaCount: z.number().optional(),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type updateProfileBasicInfoActionInput = z.infer<
  typeof updateProfileBasicInfoActionSchema
>;
export type ProfileQueryInput = z.infer<typeof profileQuerySchema>;
export type BasicProfileInfoInput = z.infer<typeof basicProfileInfoSchema>;
export type AdditionalProfileInfoInput = z.infer<
  typeof additionalProfileInfoSchema
>;
export type SocialMediaInput = z.infer<typeof socialMediaSchema>;
export type PresentationInput = z.infer<typeof presentationSchema>;
export type BillingInput = z.infer<typeof billingSchema>;
export type VerificationInput = z.infer<typeof verificationFormSchema>;
export type ProfileBasicInfoUpdateInput = z.infer<
  typeof profileBasicInfoUpdateSchema
>;
