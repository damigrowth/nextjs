/**
 * REVIEW VALIDATION SCHEMAS
 * Review and rating validation schemas
 */

import { z } from 'zod';
import { paginationSchema } from './shared';

// =============================================
// REVIEW CRUD SCHEMAS
// =============================================

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000).optional(),
  sid: z.string().optional(), // Optional service ID
  pid: z.string().min(1, 'Profile ID is required'), // Required profile ID
  published: z.boolean().default(true),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000).optional(),
  published: z.boolean().optional(),
});

export const reviewQuerySchema = z.object({
  sid: z.string().optional(),
  pid: z.string().optional(),
  authorId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  published: z.coerce.boolean().optional(),
  search: z.string().optional()
}).merge(paginationSchema);

// =============================================
// ADVANCED REVIEW SCHEMA
// =============================================

// Advanced review schema with conditional validation
export const advancedReviewSchema = z
  .object({
    type: z.string(),
    rating: z
      .number({
        errorMap: () => ({
          message: 'You must select a rating to submit the review.',
        }),
      })
      .min(1, 'You must select a rating to submit the review.'),
    service: z.object({
      id: z.string().optional(),
    }),
    comment: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Only require service for freelancer type reviews
    if (data.type === 'freelancer' && (!data.service || !data.service.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must select a service to submit the review.',
        path: ['service'],
      });
    }
  });

// =============================================
// REVIEW REACTION SCHEMAS
// =============================================

export const reviewReactionSchema = z.object({
  type: z.enum(['like', 'dislike', 'helpful', 'unhelpful']),
  reviewId: z.string().min(1, 'Review ID is required'),
});

export const updateReviewReactionSchema = z.object({
  type: z.enum(['like', 'dislike', 'helpful', 'unhelpful']).optional(),
  remove: z.boolean().default(false), // To remove existing reaction
});

// =============================================
// REVIEW STATISTICS SCHEMAS
// =============================================

export const reviewStatsSchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number().int().min(0),
  ratingDistribution: z.object({
    1: z.number().int().min(0),
    2: z.number().int().min(0),
    3: z.number().int().min(0),
    4: z.number().int().min(0),
    5: z.number().int().min(0),
  }),
  recentReviews: z.array(z.any()).optional(),
});

// =============================================
// REVIEW MODERATION SCHEMAS
// =============================================

export const reviewModerationSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  action: z.enum(['approve', 'reject', 'flag', 'unflag']),
  reason: z.string().optional(),
  moderatorNote: z.string().max(500).optional(),
});

export const bulkReviewModerationSchema = z.object({
  reviewIds: z.array(z.string()).min(1, 'At least one review ID is required'),
  action: z.enum(['approve', 'reject', 'flag', 'unflag']),
  reason: z.string().optional(),
});

// =============================================
// REVIEW REPORTING SCHEMA
// =============================================

export const reviewReportSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  reason: z.enum([
    'spam',
    'inappropriate',
    'fake',
    'off_topic',
    'harassment',
    'other'
  ]),
  description: z.string().min(10, 'Please provide more details').max(500),
  reporterEmail: z.string().email().optional(),
});

// =============================================
// REVIEW RESPONSE SCHEMAS
// =============================================

export const reviewResponseSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  response: z.string().min(10, 'Response must be at least 10 characters').max(1000),
  isPublic: z.boolean().default(true),
});

export const updateReviewResponseSchema = z.object({
  response: z.string().min(10, 'Response must be at least 10 characters').max(1000).optional(),
  isPublic: z.boolean().optional(),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
export type AdvancedReviewInput = z.infer<typeof advancedReviewSchema>;
export type ReviewReactionInput = z.infer<typeof reviewReactionSchema>;
export type UpdateReviewReactionInput = z.infer<typeof updateReviewReactionSchema>;
export type ReviewStatsInput = z.infer<typeof reviewStatsSchema>;
export type ReviewModerationInput = z.infer<typeof reviewModerationSchema>;
export type BulkReviewModerationInput = z.infer<typeof bulkReviewModerationSchema>;
export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
export type ReviewResponseInput = z.infer<typeof reviewResponseSchema>;
export type UpdateReviewResponseInput = z.infer<typeof updateReviewResponseSchema>;