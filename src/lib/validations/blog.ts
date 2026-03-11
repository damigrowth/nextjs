/**
 * BLOG VALIDATION SCHEMAS
 * Blog article and category validation schemas
 */

import { z } from 'zod';
import { paginationSchema } from './shared';

// =============================================
// ARTICLE SCHEMAS
// =============================================

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Ο τίτλος πρέπει να είναι τουλάχιστον 5 χαρακτήρες')
    .max(200, 'Ο τίτλος δεν μπορεί να ξεπερνά τους 200 χαρακτήρες'),
  excerpt: z
    .string()
    .max(500, 'Η περίληψη δεν μπορεί να ξεπερνά τους 500 χαρακτήρες')
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .min(50, 'Το περιεχόμενο πρέπει να είναι τουλάχιστον 50 χαρακτήρες'),
  coverImage: z.string().url('Μη έγκυρο URL εικόνας').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Η κατηγορία είναι υποχρεωτική'),
  authorProfileIds: z
    .array(z.string())
    .min(1, 'Απαιτείται τουλάχιστον ένας συγγραφέας'),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(['draft', 'pending', 'published']).default('draft'),
  featured: z.boolean().default(false),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  id: z.string().min(1),
});

// =============================================
// CATEGORY SCHEMAS
// =============================================

export const createBlogCategorySchema = z.object({
  label: z
    .string()
    .min(2, 'Η ετικέτα πρέπει να είναι τουλάχιστον 2 χαρακτήρες')
    .max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Μη έγκυρο slug'),
  description: z.string().max(500).optional().or(z.literal('')),
  order: z.coerce.number().int().min(0).default(0),
});

export const updateBlogCategorySchema = createBlogCategorySchema.partial().extend({
  id: z.string().min(1),
});

// =============================================
// QUERY SCHEMAS
// =============================================

export const blogArticleQuerySchema = paginationSchema.extend({
  categorySlug: z.string().optional(),
  status: z.enum(['draft', 'pending', 'published']).optional(),
  featured: z.coerce.boolean().optional(),
  authorProfileId: z.string().optional(),
  search: z.string().optional(),
});

// =============================================
// TYPES
// =============================================

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>;
export type BlogArticleQuery = z.infer<typeof blogArticleQuerySchema>;
