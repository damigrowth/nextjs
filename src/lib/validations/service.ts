/**
 * SERVICE VALIDATION SCHEMAS
 * Service entity validation schemas
 */

import { z } from 'zod';
import { paginationSchema } from './shared';

// =============================================
// SERVICE ADDON & FAQ SCHEMAS
// =============================================

export const serviceAddonSchema = z.object({
  title: z
    .string()
    .min(
      5,
      'Ο τίτλος της επιπλέον υπηρεσίας πρέπει να είναι τουλάχιστον 5 χαρακτήρες',
    ),
  description: z
    .string()
    .min(
      10,
      'Η περιγραφή της επιπλέον υπηρεσίας πρέπει να είναι τουλάχιστον 10 χαρακτήρες',
    ),
  price: z
    .number()
    .min(5, 'Η ελάχιστη τιμή είναι 5€')
    .max(10000, 'Η μέγιστη τιμή είναι 10.000€'),
});

export const serviceFaqSchema = z.object({
  question: z
    .string()
    .min(10, 'Η ερώτηση πρέπει να είναι τουλάχιστον 10 χαρακτήρες'),
  answer: z
    .string()
    .min(2, 'Η απάντηση πρέπει να είναι τουλάχιστον 2 χαρακτήρες'),
});

// =============================================
// SERVICE TAXONOMY SCHEMAS
// =============================================

// Custom validator function to check if taxonomy fields have valid IDs
const hasValidId = (field) => {
  if (!field) return false;
  if (field.id === 0 || field.id === '0') return false;
  return true;
};

export const serviceTaxonomySchema = z.union([
  z
    .object({
      id: z.union([z.string(), z.number()]),
      label: z.string().optional(),
    })
    .refine(hasValidId, {
      message: 'Αυτό το πεδίο είναι υποχρεωτικό',
      path: ['id'],
    }),
  z.null(),
]);

export const serviceTagSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  isNewTerm: z.boolean().optional(),
  data: z.any().optional(),
  attributes: z.any().optional(),
});

// =============================================
// SERVICE CRUD SCHEMAS
// =============================================

// Comprehensive service edit schema (from legacy with Greek messages)
export const serviceEditSchema = z.object({
  title: z
    .string()
    .min(1, 'Ο τίτλος είναι υποχρεωτικός')
    .max(80, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 80 χαρακτήρες')
    .optional(),
  description: z
    .string()
    .min(80, 'Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες')
    .max(5000, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 5000 χαρακτήρες')
    .optional(),
  price: z
    .number()
    .refine((val) => val === 0 || val >= 10, {
      message: 'Η τιμή πρέπει να είναι 0 ή τουλάχιστον 10€',
    })
    .optional(),
  status: z.string().optional(),
  category: serviceTaxonomySchema,
  subcategory: serviceTaxonomySchema,
  subdivision: serviceTaxonomySchema,
  tags: z.array(serviceTagSchema).optional(),
  addons: z
    .array(serviceAddonSchema)
    .max(3, 'Μέγιστος αριθμός επιπλέον υπηρεσιών: 3')
    .optional(),
  faq: z
    .array(serviceFaqSchema)
    .max(5, 'Μέγιστος αριθμός ερωτήσεων: 5')
    .optional(),
});

export const serviceQuerySchema = z
  .object({
    search: z.string().optional(),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    pricingType: z.string().optional(),
    location: z.string().optional(),
    published: z.coerce.boolean().optional(),
    featured: z.coerce.boolean().optional(),
  })
  .merge(paginationSchema);

// =============================================
// SERVICE PACKAGE SCHEMAS
// =============================================

export const servicePackageFeatureSchema = z.object({
  title: z.string().min(1, 'Ο τίτλος της λειτουργίας είναι υποχρεωτικός'),
  description: z.string().optional(),
  included: z.boolean().default(true),
});

export const servicePackageSchema = z.object({
  name: z.string().min(1, 'Το όνομα του πακέτου είναι υποχρεωτικό'),
  description: z
    .string()
    .min(
      10,
      'Η περιγραφή του πακέτου πρέπει να είναι τουλάχιστον 10 χαρακτήρες',
    ),
  price: z.number().min(0, 'Η τιμή πρέπει να είναι 0 ή θετική'),
  deliveryTime: z.string().optional(),
  revisions: z.number().int().min(0).optional(),
  features: z.array(servicePackageFeatureSchema).optional(),
});

// =============================================
// SERVICE MEDIA SCHEMAS
// =============================================

export const serviceMediaSchema = z.object({
  url: z.string().url('Άκυρο URL πολυμέσου'),
  type: z.enum(['image', 'video', 'audio', 'document']),
  title: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
  featured: z.boolean().default(false),
});

// =============================================
// SERVICE STATUS SCHEMAS
// =============================================

export const serviceStatusSchema = z.enum([
  'draft',
  'pending_review',
  'published',
  'paused',
  'rejected',
  'archived',
]);

export const updateServiceStatusSchema = z.object({
  status: serviceStatusSchema,
  reason: z.string().optional(), // For rejection reasons
});

// =============================================
// SERVICE REPORTING SCHEMA
// =============================================

export const reportServiceSchema = z.object({
  id: z.string().min(1, 'Το ID της υπηρεσίας είναι υποχρεωτικό'),
  title: z.string().min(1, 'Ο τίτλος της υπηρεσίας είναι υποχρεωτικός'),
});

export const serviceReportSchema = z.object({
  description: z
    .string()
    .min(1, 'Η περιγραφή είναι υποχρεωτική')
    .max(1000, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 1000 χαρακτήρες'),
  currentUrl: z.string().url('Άκυρο URL'),
  reporter: z.object({
    id: z.string().min(1, 'Το ID του αναφέροντα είναι υποχρεωτικό'),
    email: z.string().email('Άκυρο email αναφέροντα').optional(),
    displayName: z.string().optional(),
    username: z.string().optional(),
  }),
  reported: z.object({
    id: z.string().min(1, 'Το ID του αναφερόμενου χρήστη είναι υποχρεωτικό'),
    email: z.string().email('Άκυρο email αναφερόμενου χρήστη').optional(),
    displayName: z.string().optional(),
    username: z.string().optional(),
  }),
  service: reportServiceSchema,
});

// =============================================
// MULTI-STEP SERVICE CREATION SCHEMAS
// =============================================

export const serviceTypeConfigSchema = z.object({
  presence: z.boolean(),
  online: z.boolean(),
  oneoff: z.boolean(),
  onbase: z.boolean(),
  subscription: z.boolean(),
  onsite: z.boolean(),
});

// Step 1: Service Type Schema
export const presenceOnlineSchema = z.object({
  type: serviceTypeConfigSchema.refine(
    (data) => {
      return data.presence || data.online;
    },
    {
      message: 'Επιλέξτε τύπο υπηρεσίας',
    },
  ),
});

// Step 2a: Presence Location Schema
export const onbaseOnsiteSchema = z.object({
  type: serviceTypeConfigSchema.refine(
    (data) => {
      if (data.presence) {
        return data.onbase || data.onsite;
      }
      return true;
    },
    {
      message: 'Επιλέξτε τόπο παροχής υπηρεσίας',
    },
  ),
});

// Step 2b: Online Delivery Schema
export const oneoffSubscriptionSchema = z
  .object({
    type: serviceTypeConfigSchema.refine(
      (data) => {
        if (data.online) {
          return data.oneoff || data.subscription;
        }
        return true;
      },
      {
        message: 'Επιλέξτε τύπο παράδοσης για online υπηρεσίες',
      },
    ),
    subscriptionType: z
      .enum(['month', 'year', 'per_case', 'per_hour', 'per_session'])
      .optional(),
  })
  .refine(
    (data) => {
      // Only require subscription period if subscription type is selected
      if (data.type.subscription) {
        return data.subscriptionType !== undefined;
      }
      return true;
    },
    {
      message: 'Επιλέξτε περίοδο συνδρομής',
      path: ['subscriptionType'],
    },
  );

// Step 3: Service Details Schema
export const serviceDetailsSchema = z.object({
  title: z
    .string()
    .min(10, 'Ο τίτλος πρέπει να είναι τουλάχιστον 10 χαρακτήρες')
    .max(100, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 100 χαρακτήρες'),
  description: z
    .string()
    .min(80, 'Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες')
    .max(5000, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 5000 χαρακτήρες'),
  category: z.string().min(1, 'Η κατηγορία είναι υποχρεωτική'),
  subcategory: z.string().min(1, 'Η υποκατηγορία είναι υποχρεωτική'),
  subdivision: z.string().min(1, 'Η υποδιαίρεση είναι υποχρεωτική'),
  tags: z
    .array(z.string().min(1, 'Απαιτείται έγκυρη ετικέτα'))
    .min(1, 'Επιλέξτε τουλάχιστον μία ετικέτα')
    .max(10, 'Μπορείτε να επιλέξετε έως 10 ετικέτες'),
  price: z
    .number()
    .int()
    .min(1, 'Η τιμή πρέπει να είναι τουλάχιστον 1€')
    .max(10000, 'Η τιμή δεν μπορεί να ξεπερνά τα 10.000€'),
  fixed: z.boolean().default(true),
  duration: z
    .number()
    .int()
    .min(1, 'Η διάρκεια πρέπει να είναι τουλάχιστον 1 ημέρα')
    .max(365, 'Η διάρκεια δεν μπορεί να ξεπερνά τις 365 ημέρες')
    .optional(),
});

// Step 4: Addons and FAQ Schema (optional)
export const addonsAndFaqSchema = z.object({
  addons: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, 'Ο τίτλος της επιπλέον υπηρεσίας είναι υποχρεωτικός')
          .max(100, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 100 χαρακτήρες'),
        description: z
          .string()
          .min(1, 'Η περιγραφή της επιπλέον υπηρεσίας είναι υποχρεωτική')
          .max(500, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 500 χαρακτήρες'),
        price: z
          .number()
          .int()
          .min(
            1,
            'Η τιμή της επιπλέον υπηρεσίας πρέπει να είναι τουλάχιστον 1€',
          )
          .max(
            5000,
            'Η τιμή της επιπλέον υπηρεσίας δεν μπορεί να ξεπερνά τα 5.000€',
          ),
      }),
    )
    .max(3, 'Μπορείτε να προσθέσετε έως 3 επιπλέον υπηρεσίες')
    .optional(),
  faq: z
    .array(
      z.object({
        question: z
          .string()
          .min(1, 'Η ερώτηση είναι υποχρεωτική')
          .max(200, 'Η ερώτηση δεν μπορεί να ξεπερνά τους 200 χαρακτήρες'),
        answer: z
          .string()
          .min(1, 'Η απάντηση είναι υποχρεωτική')
          .max(1000, 'Η απάντηση δεν μπορεί να ξεπερνά τους 1000 χαρακτήρες'),
      }),
    )
    .max(5, 'Μπορείτε να προσθέσετε έως 5 συχνές ερωτήσεις')
    .optional(),
});

// Step 5: Media Schema (optional)
export const serviceMediaUploadSchema = z.object({
  media: z
    .array(z.any())
    .max(10, 'Μπορείτε να ανεβάσετε έως 10 αρχεία πολυμέσων')
    .optional(),
});

// Service type configuration object (matches Prisma JSON field)

// Complete Multi-Step Service Creation Schema
export const createServiceSchema = z
  .object({
    // Service type configuration (Boolean object matching Prisma schema)
    type: serviceTypeConfigSchema,

    // Subscription period (only for subscription services)
    subscriptionType: z
      .enum(['month', 'year', 'per_case', 'per_hour', 'per_session'])
      .optional(),

    // Step 3 data
    title: z
      .string()
      .min(10, 'Ο τίτλος πρέπει να είναι τουλάχιστον 10 χαρακτήρες')
      .max(100, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 100 χαρακτήρες'),
    description: z
      .string()
      .min(80, 'Η περιγραφή πρέπει να είναι τουλάχιστον 80 χαρακτήρες')
      .max(5000, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 5000 χαρακτήρες'),
    category: z.string().min(1, 'Η κατηγορία είναι υποχρεωτική'),
    subcategory: z.string().min(1, 'Η υποκατηγορία είναι υποχρεωτική'),
    subdivision: z.string().min(1, 'Η υποδιαίρεση είναι υποχρεωτική'),
    tags: z
      .array(z.string())
      .min(1, 'Επιλέξτε τουλάχιστον μία ετικέτα')
      .max(10, 'Μπορείτε να επιλέξετε έως 10 ετικέτες'),
    price: z
      .number()
      .int()
      .min(1, 'Η τιμή πρέπει να είναι τουλάχιστον 1€')
      .max(10000, 'Η τιμή δεν μπορεί να ξεπερνά τα 10.000€'),
    fixed: z.boolean(),
    duration: z
      .number()
      .int()
      .min(1, 'Η διάρκεια πρέπει να είναι τουλάχιστον 1 ημέρα')
      .max(365, 'Η διάρκεια δεν μπορεί να ξεπερνά τις 365 ημέρες')
      .optional(),

    // Step 4 data
    addons: z
      .array(
        z.object({
          title: z
            .string()
            .min(1, 'Ο τίτλος της επιπλέον υπηρεσίας είναι υποχρεωτικός')
            .max(100, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 100 χαρακτήρες'),
          description: z
            .string()
            .min(1, 'Η περιγραφή της επιπλέον υπηρεσίας είναι υποχρεωτική')
            .max(500, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 500 χαρακτήρες'),
          price: z
            .number()
            .int()
            .min(
              1,
              'Η τιμή της επιπλέον υπηρεσίας πρέπει να είναι τουλάχιστον 1€',
            )
            .max(
              5000,
              'Η τιμή της επιπλέον υπηρεσίας δεν μπορεί να ξεπερνά τα 5.000€',
            ),
        }),
      )
      .optional(),
    faq: z
      .array(
        z.object({
          question: z
            .string()
            .min(1, 'Η ερώτηση είναι υποχρεωτική')
            .max(200, 'Η ερώτηση δεν μπορεί να ξεπερνά τους 200 χαρακτήρες'),
          answer: z
            .string()
            .min(1, 'Η απάντηση είναι υποχρεωτική')
            .max(1000, 'Η απάντηση δεν μπορεί να ξεπερνά τους 1000 χαρακτήρες'),
        }),
      )
      .optional(),

    // Step 5 data
    media: z
      .array(z.any())
      .max(10, 'Μπορείτε να ανεβάσετε έως 10 αρχεία')
      .optional(),
  })
  .refine(
    (data) => {
      // Validate that at least one service type is selected
      const hasPresence = data.type.presence;
      const hasOnline = data.type.online;
      return hasPresence || hasOnline;
    },
    {
      message: 'Επιλέξτε τουλάχιστον έναν τύπο υπηρεσίας',
      path: ['type'],
    },
  )
  .refine(
    (data) => {
      // Validate presence service location
      if (data.type.presence) {
        return data.type.onbase || data.type.onsite;
      }
      return true;
    },
    {
      message: 'Επιλέξτε τόπο παροχής για υπηρεσίες φυσικής παρουσίας',
      path: ['type'],
    },
  )
  .refine(
    (data) => {
      // Validate online service delivery type
      if (data.type.online) {
        return data.type.oneoff || data.type.subscription;
      }
      return true;
    },
    {
      message: 'Επιλέξτε τύπο παράδοσης για online υπηρεσίες',
      path: ['type'],
    },
  )
  .refine(
    (data) => {
      // Validate subscription period for subscription services
      if (data.type.subscription) {
        return data.subscriptionType !== undefined;
      }
      return true;
    },
    {
      message: 'Επιλέξτε περίοδο συνδρομής',
      path: ['subscription'],
    },
  );

// Draft Service Schema - All fields optional for saving incomplete work
export const createServiceDraftSchema = z.object({
  // Service type configuration (optional for drafts)
  type: serviceTypeConfigSchema.optional(),

  // Subscription period (optional)
  subscriptionType: z
    .enum(['month', 'year', 'per_case', 'per_hour', 'per_session'])
    .optional(),

  // Basic service info (all optional for drafts)
  title: z
    .string()
    .max(100, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 100 χαρακτήρες')
    .optional(),
  description: z
    .string()
    .max(5000, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 5000 χαρακτήρες')
    .optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  subdivision: z.string().optional(),
  tags: z
    .array(z.string())
    .max(10, 'Μπορείτε να επιλέξετε έως 10 ετικέτες')
    .optional(),
  price: z
    .number()
    .int()
    .min(0, 'Η τιμή δεν μπορεί να είναι αρνητική')
    .max(10000, 'Η τιμή δεν μπορεί να ξεπερνά τα 10.000€')
    .optional(),
  fixed: z.boolean().optional(),
  duration: z
    .number()
    .int()
    .min(1, 'Η διάρκεια πρέπει να είναι τουλάχιστον 1 ημέρα')
    .max(365, 'Η διάρκεια δεν μπορεί να ξεπερνά τις 365 ημέρες')
    .optional(),

  // Addons and FAQ (optional)
  addons: z
    .array(
      z.object({
        title: z
          .string()
          .max(100, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 100 χαρακτήρες'),
        description: z
          .string()
          .max(500, 'Η περιγραφή δεν μπορεί να ξεπερνά τους 500 χαρακτήρες'),
        price: z
          .number()
          .int()
          .min(0, 'Η τιμή δεν μπορεί να είναι αρνητική')
          .max(5000, 'Η τιμή δεν μπορεί να ξεπερνά τα 5.000€'),
      }),
    )
    .max(3, 'Μπορείτε να προσθέσετε έως 3 επιπλέον υπηρεσίες')
    .optional(),
  faq: z
    .array(
      z.object({
        question: z
          .string()
          .max(200, 'Η ερώτηση δεν μπορεί να ξεπερνά τους 200 χαρακτήρες'),
        answer: z
          .string()
          .max(1000, 'Η απάντηση δεν μπορεί να ξεπερνά τους 1000 χαρακτήρες'),
      }),
    )
    .max(5, 'Μπορείτε να προσθέσετε έως 5 συχνές ερωτήσεις')
    .optional(),

  // Media (optional)
  media: z
    .array(z.any())
    .max(10, 'Μπορείτε να ανεβάσετε έως 10 αρχεία')
    .optional(),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type ServiceEditInput = z.infer<typeof serviceEditSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
export type ServiceAddonInput = z.infer<typeof serviceAddonSchema>;
export type ServiceFaqInput = z.infer<typeof serviceFaqSchema>;
export type ServicePackageInput = z.infer<typeof servicePackageSchema>;
export type ServiceMediaInput = z.infer<typeof serviceMediaSchema>;
export type ServiceReportInput = z.infer<typeof serviceReportSchema>;

// Multi-step form types
export type ServiceTypeInput = z.infer<typeof presenceOnlineSchema>;
export type PresenceLocationInput = z.infer<typeof onbaseOnsiteSchema>;
export type OnlineDeliveryInput = z.infer<typeof oneoffSubscriptionSchema>;
export type ServiceDetailsInput = z.infer<typeof serviceDetailsSchema>;
export type AddonsAndFaqInput = z.infer<typeof addonsAndFaqSchema>;
export type ServiceMediaUploadInput = z.infer<typeof serviceMediaUploadSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateServiceDraftInput = z.infer<typeof createServiceDraftSchema>;
export type ServiceTypeConfig = z.infer<typeof serviceTypeConfigSchema>;
