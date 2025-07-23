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
    .min(5, 'Add-on title must be at least 5 characters'),
  description: z
    .string()
    .min(10, 'Add-on description must be at least 10 characters'),
  price: z
    .number()
    .min(5, 'Minimum price is €5')
    .max(10000, 'Maximum price is €10000'),
});

export const serviceFaqSchema = z.object({
  question: z
    .string()
    .min(10, 'Question must be at least 10 characters'),
  answer: z
    .string()
    .min(2, 'Answer must be at least 2 characters'),
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
      message: 'This field is required',
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

// Simple service creation schema (English for API/admin use)
export const createServiceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(80),
  description: z.string().min(80, 'Description must be at least 80 characters').max(5000),
  price: z.number().min(0, 'Price must be 0 or positive'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pricingType: z.string().optional(),
  duration: z.string().optional(),
  location: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
});

export const updateServiceSchema = createServiceSchema.partial();

// Comprehensive service edit schema (from legacy with Greek messages)
export const serviceEditSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(80, 'Title cannot exceed 80 characters')
    .optional(),
  description: z
    .string()
    .min(80, 'Description must be at least 80 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  price: z
    .number()
    .refine((val) => val === 0 || val >= 10, {
      message: 'Price must be 0 or at least €10',
    })
    .optional(),
  status: z.string().optional(),
  category: serviceTaxonomySchema,
  subcategory: serviceTaxonomySchema,
  subdivision: serviceTaxonomySchema,
  tags: z.array(serviceTagSchema).optional(),
  addons: z
    .array(serviceAddonSchema)
    .max(3, 'Maximum number of add-ons: 3')
    .optional(),
  faq: z
    .array(serviceFaqSchema)
    .max(5, 'Maximum number of questions: 5')
    .optional(),
});

export const serviceQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  pricingType: z.string().optional(),
  location: z.string().optional(),
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
}).merge(paginationSchema);

// =============================================
// SERVICE PACKAGE SCHEMAS
// =============================================

export const servicePackageFeatureSchema = z.object({
  title: z.string().min(1, 'Feature title is required'),
  description: z.string().optional(),
  included: z.boolean().default(true),
});

export const servicePackageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  description: z.string().min(10, 'Package description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be 0 or positive'),
  deliveryTime: z.string().optional(),
  revisions: z.number().int().min(0).optional(),
  features: z.array(servicePackageFeatureSchema).optional(),
});

// =============================================
// SERVICE MEDIA SCHEMAS
// =============================================

export const serviceMediaSchema = z.object({
  url: z.string().url('Invalid media URL'),
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
  'archived'
]);

export const updateServiceStatusSchema = z.object({
  status: serviceStatusSchema,
  reason: z.string().optional(), // For rejection reasons
});

// =============================================
// SERVICE REPORTING SCHEMA
// =============================================

export const reportServiceSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
  title: z.string().min(1, 'Service title is required'),
});

export const serviceReportSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  currentUrl: z.string().url('Invalid URL'),
  reporter: z.object({
    id: z.string().min(1, 'Reporter ID is required'),
    email: z.string().email('Invalid reporter email').optional(),
    displayName: z.string().optional(),
    username: z.string().optional(),
  }),
  reported: z.object({
    id: z.string().min(1, 'Reported user ID is required'),
    email: z.string().email('Invalid reported user email').optional(),
    displayName: z.string().optional(),
    username: z.string().optional(),
  }),
  service: reportServiceSchema,
});

// =============================================
// TYPE EXPORTS
// =============================================

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceEditInput = z.infer<typeof serviceEditSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;
export type ServiceAddonInput = z.infer<typeof serviceAddonSchema>;
export type ServiceFaqInput = z.infer<typeof serviceFaqSchema>;
export type ServicePackageInput = z.infer<typeof servicePackageSchema>;
export type ServiceMediaInput = z.infer<typeof serviceMediaSchema>;
export type ServiceReportInput = z.infer<typeof serviceReportSchema>;