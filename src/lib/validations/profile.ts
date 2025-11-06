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
import { cloudinaryResourceSchema } from '@/lib/prisma/json-types';

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

export const updateProfileBasicInfoSchema = createProfileSchema.partial();

export const profileQuerySchema = z
  .object({
    search: z.string().optional(),
    type: z.string().optional(),
    verified: z.boolean().optional(),
    featured: z.boolean().optional(),
    published: z.boolean().optional(),
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
// Now uses ID-based structure for better normalization
export const coverageSchema = z
  .object({
    online: z.boolean(),
    onbase: z.boolean(),
    onsite: z.boolean(),
    address: z.string().optional(),
    area: z.string().nullable().optional(), // Single area ID
    county: z.string().nullable().optional(), // Single county ID
    zipcode: z.string().nullable().optional(), // Single zipcode ID
    counties: z.array(z.string()).optional(), // Array of county IDs
    areas: z.array(z.string()).optional(), // Array of area IDs
  })
  .refine(
    (data) => {
      // At least one coverage option must be selected
      return data.online || data.onbase || data.onsite;
    },
    {
      message: 'Επιλέξτε τουλάχιστον έναν τρόπο εργασίας',
      path: ['online'], // Show error on first checkbox
    }
  )
  .refine(
    (data) => {
      // If onbase is selected, address, zipcode, area, and county are required
      if (data.onbase) {
        return (
          data.address &&
          data.address.trim() !== '' &&
          data.zipcode &&
          data.zipcode.trim() !== '' &&
          data.area &&
          data.area.trim() !== '' &&
          data.county &&
          data.county.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Όλα τα πεδία για "Στον χώρο μου" είναι υποχρεωτικά',
      path: ['address'],
    }
  )
  .refine(
    (data) => {
      // If onsite is selected, counties array must have at least one item
      if (data.onsite) {
        return data.counties && data.counties.length > 0;
      }
      return true;
    },
    {
      message: 'Επιλέξτε τουλάχιστον έναν νομό για "Στον χώρο του πελάτη"',
      path: ['counties'],
    }
  );

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
  budget: z.string().optional().nullable(), // Updated field name
  industries: z
    .array(z.string())
    .max(10, 'You can select up to 10 industries')
    .optional()
    .nullable(),
  contactMethods: z.array(z.string()).optional().nullable(), // Updated field name
  paymentMethods: z.array(z.string()).optional().nullable(), // Updated field name
  settlementMethods: z.array(z.string()).optional().nullable(), // Updated field name
  rate: z.number().min(10).max(50000).optional().nullable(),
  commencement: z.string().optional().nullable(), // Changed to string to match schema
  experience: z.number().int().min(0).optional().nullable(), // Added experience field
});

// =============================================
// SOCIAL MEDIA SCHEMA
// =============================================

export const socialMediaSchema = z.object({
  facebook: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  linkedin: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  x: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  youtube: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  github: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  instagram: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  behance: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  dribbble: z
    .string()
    .url('Εισάγετε έγκυρο URL')
    .optional()
    .nullable()
    .or(z.literal('')),
});

// =============================================
// PORTFOLIO MEDIA SCHEMAS
// =============================================

/**
 * Portfolio media validation schema
 * Used for both client-side and server-side validation
 */
export const updateProfilePortfolioSchema = z.object({
  portfolio: z
    .array(cloudinaryResourceSchema)
    .max(10, 'Μπορείτε να ανεβάσετε έως 10 αρχεία')
    .optional(),
});

export type UpdateProfilePortfolioInput = z.infer<
  typeof updateProfilePortfolioSchema
>;

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
  socials: socialMediaSchema.optional().nullable(),
  phone: z
    .string()
    .regex(/^\d{10,12}$/, 'Enter a valid phone number (10-12 digits)')
    .optional()
    .nullable()
    .or(z.literal('')),
  viber: z
    .string()
    .regex(/^\d{10,12}$/, 'Enter a valid Viber number (10-12 digits)')
    .optional()
    .nullable()
    .or(z.literal('')),
  whatsapp: z
    .string()
    .regex(/^\d{10,12}$/, 'Enter a valid WhatsApp number (10-12 digits)')
    .optional()
    .nullable()
    .or(z.literal('')),
  visibility: z
    .object({
      email: z.boolean(),
      phone: z.boolean(),
      address: z.boolean(),
    })
    .default({
      email: true,
      phone: true,
      address: true,
    }),
  portfolio: z
    .array(cloudinaryResourceSchema)
    .max(10, 'Μπορείτε να ανεβάσετε έως 10 αρχεία')
    .optional()
    .nullable(),
});

// =============================================
// BILLING SCHEMAS
// =============================================

export const billingSchema = z
  .object({
    receipt: z.boolean(),
    invoice: z.boolean(),
    afm: z.string().optional().or(z.literal('')),
    doy: z.string().optional().or(z.literal('')),
    name: z.string().optional().or(z.literal('')),
    profession: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      // At least one option must be selected
      return data.receipt || data.invoice;
    },
    {
      message: 'Παρακαλώ επιλέξτε τύπο παραστατικού',
      path: ['billingType'], // Use a separate field that doesn't exist to avoid checkbox styling
    },
  )
  .refine(
    (data) => {
      if (data.invoice) {
        return (
          data.afm &&
          data.afm.trim() !== '' &&
          data.doy &&
          data.doy.trim() !== '' &&
          data.name &&
          data.name.trim() !== '' &&
          data.profession &&
          data.profession.trim() !== '' &&
          data.address &&
          data.address.trim() !== ''
        );
      }
      return true;
    },
    {
      message: 'Όλα τα πεδία είναι υποχρεωτικά όταν επιλέγεται τιμολόγιο',
      path: ['invoiceFields'], // Use a separate field to avoid checkbox styling
    },
  )
  .refine(
    (data) => {
      if (data.invoice && data.afm) {
        return /^\d{9}$/.test(data.afm.trim());
      }
      return true;
    },
    {
      message: 'Ο ΑΦΜ πρέπει να είναι ακριβώς 9 ψηφία',
      path: ['afm'],
    },
  );

// =============================================
// VERIFICATION SCHEMA
// =============================================

export const verificationFormSchema = z.object({
  afm: z
    .string()
    .min(1, 'Ο ΑΦΜ είναι υποχρεωτικός')
    .max(20, 'Ο ΑΦΜ δεν μπορεί να υπερβαίνει τους 20 χαρακτήρες'),
  name: z
    .string()
    .min(2, 'Το όνομα είναι υποχρεωτικό')
    .max(100, 'Το όνομα δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες'),
  address: z
    .string()
    .min(5, 'Η διεύθυνση είναι υποχρεωτική')
    .max(200, 'Η διεύθυνση δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες'),
  phone: z
    .string()
    .min(1, 'Το τηλέφωνο είναι υποχρεωτικό')
    .max(50, 'Το τηλέφωνο δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες'),
});

// Removed duplicate cloudinaryResourceSchema - now imported from @/lib/prisma/json-types

export const imageSchema = z.union([
  cloudinaryResourceSchema,
  z.string().url(), // Allow string URLs for Google/external images
  z.null(),
]);

// Category/Subcategory selection for onboarding - now accepts ID strings
export const categorySchema = z.string().min(1, 'Κατηγορία είναι υποχρεωτική');

// Profile update schema for basic info form
export const profileBasicInfoUpdateSchema = z.object({
  tagline: z
    .string()
    .refine(
      (val) => val === '' || val.length >= 10,
      'Το tagline πρέπει να έχει τουλάχιστον 10 χαρακτήρες',
    )
    .refine(
      (val) => val.length <= 100,
      'Το tagline δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες',
    ),
  bio: z
    .string()
    .min(80, 'Η περιγραφή πρέπει να έχει τουλάχιστον 80 χαρακτήρες')
    .max(5000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες'),
  category: z.string().min(1, 'Η κατηγορία είναι υποχρεωτική'),
  subcategory: z.string().min(1, 'Η υποκατηγορία είναι υποχρεωτική'),
  skills: z
    .array(z.string().min(1, 'Skill ID is required'))
    .max(10, 'Μπορείτε να επιλέξετε έως 10 δεξιότητες')
    .optional()
    .transform((val) => val ?? []),
  speciality: z.string().optional().or(z.literal('')),
});

// Profile additional info update schema for new fields
export const profileAdditionalInfoUpdateSchema = z.object({
  rate: z.number().int().min(0).optional().nullable(),
  commencement: z.string().optional().or(z.literal('')),
  experience: z.number().int().min(0).optional().nullable(),
  contactMethods: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  settlementMethods: z.array(z.string()).optional(),
  budget: z.string().optional().or(z.literal('')),
  industries: z
    .array(z.string())
    .max(10, 'Maximum 10 industries allowed')
    .optional(),
  terms: z.string().optional().or(z.literal('')),
});

// Profile presentation update schema for presentation info form
export const profilePresentationUpdateSchema = z.object({
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url().or(z.literal('')).optional(),
  viber: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  visibility: z
    .object({
      email: z.boolean(),
      phone: z.boolean(),
      address: z.boolean(),
    })
    .optional(),
  socials: socialMediaSchema.optional(),
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
  portfolio: z
    .array(cloudinaryResourceSchema)
    .max(10, 'Μπορείτε να ανεβάσετε έως 10 αρχεία')
    .optional(), // Optional - Cloudinary resources with max validation
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
export type updateProfileBasicInfoInput = z.infer<
  typeof updateProfileBasicInfoSchema
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
export type ProfileAdditionalInfoUpdateInput = z.infer<
  typeof profileAdditionalInfoUpdateSchema
>;
export type ProfilePresentationUpdateInput = z.infer<
  typeof profilePresentationUpdateSchema
>;
