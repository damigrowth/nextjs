/**
 * Review Route Handlers - CORRECTED FOR ACTUAL PRISMA SCHEMA
 * Following Hono docs with proper zValidator usage and AppError handling
 */

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  createReviewSchema,
  updateReviewSchema,
  reviewQuerySchema,
  idParamSchema,
} from '@/lib/api/validations.ts';
import { executeQuery } from '@/lib/api/database.ts';
import { prisma } from '../../../../prisma/client.ts';
import {
  successResponse,
  paginatedResponse,
  withErrorHandling,
  validateResourceAccess,
} from '@/lib/api/error-handler.ts';
import { AppError } from '@/lib/errors';

/**
 * GET /reviews
 * Get all reviews with pagination and filters
 */
const getReviewsHandler = withErrorHandling(async (c: any) => {
  const {
    page,
    limit,
    sid,
    pid,
    authorId,
    rating,
    published,
    search,
    sort,
    order,
  } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    published: published !== undefined ? published : true,
    ...(sid && { sid }),
    ...(pid && { pid }),
    ...(authorId && { authorId }),
    ...(rating && { rating }),
    ...(search && {
      comment: { contains: search, mode: Prisma.QueryMode.insensitive },
    }),
  };

  const [reviewsResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.review.findMany({
          where,
          select: {
            id: true,
            rating: true,
            comment: true,
            published: true,
            sid: true,
            pid: true,
            authorId: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
            profile: {
              select: {
                id: true,
                uid: true,
                tagline: true,
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            service: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get reviews',
    ),
    executeQuery(() => prisma.review.count({ where }), 'Count reviews'),
  ]);

  if (!reviewsResult.success) {
    throw reviewsResult.error!;
  }

  if (!countResult.success) {
    throw countResult.error!;
  }

  const pagination = {
    page,
    limit,
    total: countResult.data!,
    hasNext: offset + limit < countResult.data!,
    hasPrev: page > 1,
  };

  return paginatedResponse(
    reviewsResult.data!,
    pagination,
    'Reviews retrieved successfully',
  );
}, 'Get reviews');

export const getReviews = [
  zValidator('query', reviewQuerySchema),
  getReviewsHandler,
];

/**
 * GET /reviews/:id
 * Get review by ID
 */
const getReviewByIdHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');

  const result = await executeQuery(
    () =>
      prisma.review.findUnique({
        where: { id },
        select: {
          id: true,
          rating: true,
          comment: true,
          published: true,
          sid: true,
          pid: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
              type: true,
            },
          },
          profile: {
            select: {
              id: true,
              uid: true,
              tagline: true,
              description: true,
              verified: true,
              rating: true,
              reviewCount: true,
              user: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              category: true,
            },
          },
        },
      }),
    'Get review by ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Review not found');
  }

  return successResponse(result.data, 'Review retrieved successfully');
}, 'Get review by ID');

export const getReviewById = [
  zValidator('param', idParamSchema),
  getReviewByIdHandler,
];

/**
 * POST /reviews
 * Create new review
 */
const createReviewHandler = withErrorHandling(async (c: any) => {
  const reviewData = c.req.valid('json');
  const user = c.get('user');

  // Check if user has already reviewed this profile/service combination
  const existingReviewResult = await executeQuery(
    () =>
      prisma.review.findFirst({
        where: {
          pid: reviewData.pid,
          authorId: user.id,
          ...(reviewData.sid && { sid: reviewData.sid }),
        },
      }),
    'Check existing review',
  );

  if (!existingReviewResult.success) {
    throw existingReviewResult.error!;
  }

  if (existingReviewResult.data) {
    throw AppError.conflict('You have already reviewed this profile/service');
  }

  // Check if profile exists
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { id: reviewData.pid },
        select: { id: true, uid: true },
      }),
    'Check profile existence',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.notFound('Profile not found');
  }

  // Prevent users from reviewing their own profile
  if (profileResult.data.uid === user.id) {
    throw AppError.forbidden('You cannot review your own profile');
  }

  // If service ID is provided, verify it exists and belongs to the profile
  if (reviewData.sid) {
    const serviceResult = await executeQuery(
      () =>
        prisma.service.findUnique({
          where: { id: reviewData.sid },
          select: { id: true, pid: true },
        }),
      'Check service existence',
    );

    if (!serviceResult.success) {
      throw serviceResult.error!;
    }

    if (!serviceResult.data) {
      throw AppError.notFound('Service not found');
    }

    if (serviceResult.data.pid !== reviewData.pid) {
      throw AppError.badRequest('Service does not belong to this profile');
    }
  }

  const result = await executeQuery(
    () =>
      prisma.review.create({
        data: {
          ...reviewData,
          authorId: user.id,
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          published: true,
          sid: true,
          pid: true,
          authorId: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          profile: {
            select: {
              id: true,
              uid: true,
              tagline: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
    'Create review',
  );

  if (!result.success) {
    throw result.error!;
  }

  // Update profile rating statistics
  await updateProfileRating(reviewData.pid);

  // Update service rating statistics if review is for a service
  if (reviewData.sid) {
    await updateServiceRating(reviewData.sid);
  }

  return successResponse(result.data, 'Review created successfully', 201);
}, 'Create review');

export const createReview = [
  zValidator('json', createReviewSchema),
  createReviewHandler,
];

/**
 * PUT /reviews/:id
 * Update review
 */const updateReviewHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const reviewData = c.req.valid('json');
  const user = c.get('user');

  // Check if review exists and user owns it
  const existingReviewResult = await executeQuery(
    () =>
      prisma.review.findUnique({
        where: { id },
        select: { authorId: true, pid: true, sid: true },
      }),
    'Check review ownership',
  );

  if (!existingReviewResult.success) {
    throw existingReviewResult.error!;
  }

  if (!existingReviewResult.data) {
    throw AppError.notFound('Review not found');
  }

  validateResourceAccess(existingReviewResult.data.authorId, user);

  const result = await executeQuery(
    () =>
      prisma.review.update({
        where: { id },
        data: reviewData,
        select: {
          id: true,
          rating: true,
          comment: true,
          published: true,
          sid: true,
          pid: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      }),
    'Update review',
  );

  if (!result.success) {
    throw result.error!;
  }

  // Update rating statistics if rating was changed
  if (reviewData.rating) {
    await updateProfileRating(existingReviewResult.data.pid);
    if (existingReviewResult.data.sid) {
      await updateServiceRating(existingReviewResult.data.sid);
    }
  }

  return successResponse(result.data, 'Review updated successfully');
}, 'Update review');

export const updateReview = [
  zValidator('param', idParamSchema),
  zValidator('json', updateReviewSchema),
  updateReviewHandler,
];

/**
 * DELETE /reviews/:id
 * Delete review
 */
const deleteReviewHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // Check if review exists and user owns it
  const existingReviewResult = await executeQuery(
    () =>
      prisma.review.findUnique({
        where: { id },
        select: { authorId: true, pid: true, sid: true },
      }),
    'Check review ownership',
  );

  if (!existingReviewResult.success) {
    throw existingReviewResult.error!;
  }

  if (!existingReviewResult.data) {
    throw AppError.notFound('Review not found');
  }

  validateResourceAccess(existingReviewResult.data.authorId, user);

  const result = await executeQuery(
    () =>
      prisma.review.delete({
        where: { id },
        select: {
          id: true,
        },
      }),
    'Delete review',
  );

  if (!result.success) {
    throw result.error!;
  }

  // Update rating statistics
  await updateProfileRating(existingReviewResult.data.pid);
  if (existingReviewResult.data.sid) {
    await updateServiceRating(existingReviewResult.data.sid);
  }

  return successResponse(result.data, 'Review deleted successfully');
}, 'Delete review');

export const deleteReview = [
  zValidator('param', idParamSchema),
  deleteReviewHandler,
];

/**
 * GET /reviews/profile/:profileId
 * Get reviews for a specific profile
 */
const getReviewsByProfileHandler = withErrorHandling(async (c: any) => {
  const { profileId } = c.req.valid('param');
  const { page, limit, rating, published, sort, order } =
    c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    pid: profileId,
    published: published !== undefined ? published : true,
    ...(rating && { rating }),
  };

  const [reviewsResult, countResult, statsResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.review.findMany({
          where,
          select: {
            id: true,
            rating: true,
            comment: true,
            published: true,
            sid: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
            service: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get reviews by profile',
    ),
    executeQuery(
      () => prisma.review.count({ where }),
      'Count reviews by profile',
    ),
    executeQuery(
      () =>
        prisma.review.groupBy({
          by: ['rating'],
          where: { pid: profileId, published: true },
          _count: {
            rating: true,
          },
        }),
      'Get rating statistics',
    ),
  ]);

  if (!reviewsResult.success) {
    throw reviewsResult.error!;
  }

  if (!countResult.success) {
    throw countResult.error!;
  }

  const pagination = {
    page,
    limit,
    total: countResult.data!,
    hasNext: offset + limit < countResult.data!,
    hasPrev: page > 1,
  };

  // Calculate rating distribution
  const ratingStats = statsResult.success ? statsResult.data! : [];
  const totalReviews = countResult.data!;
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  ratingStats.forEach((stat: any) => {
    ratingDistribution[stat.rating] = stat._count.rating;
  });

  const averageRating =
    totalReviews > 0
      ? ratingStats.reduce(
          (sum: number, stat: any) => sum + stat.rating * stat._count.rating,
          0,
        ) / totalReviews
      : 0;

  return successResponse(
    {
      reviews: reviewsResult.data,
      pagination,
      statistics: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    },
    'Reviews retrieved successfully',
  );
}, 'Get reviews by profile');

export const getReviewsByProfile = [
  zValidator('param', z.object({ profileId: idParamSchema.shape.id })),
  zValidator('query', reviewQuerySchema.omit({ pid: true })),
  getReviewsByProfileHandler,
];

/**
 * GET /reviews/service/:serviceId
 * Get reviews for a specific service
 */
const getReviewsByServiceHandler = withErrorHandling(async (c: any) => {
  const { serviceId } = c.req.valid('param');
  const { page, limit, rating, published, sort, order } =
    c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    sid: serviceId,
    published: published !== undefined ? published : true,
    ...(rating && { rating }),
  };

  const [reviewsResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.review.findMany({
          where,
          select: {
            id: true,
            rating: true,
            comment: true,
            published: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get reviews by service',
    ),
    executeQuery(
      () => prisma.review.count({ where }),
      'Count reviews by service',
    ),
  ]);

  if (!reviewsResult.success) {
    throw reviewsResult.error!;
  }

  if (!countResult.success) {
    throw countResult.error!;
  }

  const pagination = {
    page,
    limit,
    total: countResult.data!,
    hasNext: offset + limit < countResult.data!,
    hasPrev: page > 1,
  };

  return paginatedResponse(
    reviewsResult.data!,
    pagination,
    'Reviews retrieved successfully',
  );
}, 'Get reviews by service');

export const getReviewsByService = [
  zValidator('param', z.object({ serviceId: idParamSchema.shape.id })),
  zValidator('query', reviewQuerySchema.omit({ sid: true })),
  getReviewsByServiceHandler,
];

/**
 * GET /reviews/user/:userId
 * Get reviews by a specific user (author)
 */
const getReviewsByUserHandler = withErrorHandling(async (c: any) => {
  const { userId } = c.req.valid('param');
  const { page, limit, rating, published, sort, order } =
    c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    authorId: userId,
    published: published !== undefined ? published : true,
    ...(rating && { rating }),
  };

  const [reviewsResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.review.findMany({
          where,
          select: {
            id: true,
            rating: true,
            comment: true,
            published: true,
            sid: true,
            pid: true,
            createdAt: true,
            profile: {
              select: {
                id: true,
                tagline: true,
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                  },
                },
              },
            },
            service: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get reviews by user',
    ),
    executeQuery(
      () => prisma.review.count({ where }),
      'Count reviews by user',
    ),
  ]);

  if (!reviewsResult.success) {
    throw reviewsResult.error!;
  }

  if (!countResult.success) {
    throw countResult.error!;
  }

  const pagination = {
    page,
    limit,
    total: countResult.data!,
    hasNext: offset + limit < countResult.data!,
    hasPrev: page > 1,
  };

  return paginatedResponse(
    reviewsResult.data!,
    pagination,
    'Reviews retrieved successfully',
  );
}, 'Get reviews by user');

export const getReviewsByUser = [
  zValidator('param', z.object({ userId: idParamSchema.shape.id })),
  zValidator('query', reviewQuerySchema.omit({ authorId: true })),
  getReviewsByUserHandler,
];

/**
 * Helper function to update profile rating statistics
 */
async function updateProfileRating(profileId: string): Promise<void> {
  try {
    const result = await executeQuery(
      () =>
        prisma.review.aggregate({
          where: { pid: profileId, published: true },
          _avg: { rating: true },
          _count: { rating: true },
        }),
      'Calculate profile rating stats',
    );

    if (result.success && result.data) {
      await executeQuery(
        () =>
          prisma.profile.update({
            where: { id: profileId },
            data: {
              rating: result.data!._avg.rating || 0,
              reviewCount: result.data!._count.rating,
            },
          }),
        'Update profile rating',
      );
    }
  } catch (error) {
    console.error('Error updating profile rating:', error);
  }
}

/**
 * Helper function to update service rating statistics
 */
async function updateServiceRating(serviceId: string): Promise<void> {
  try {
    const result = await executeQuery(
      () =>
        prisma.review.aggregate({
          where: { sid: serviceId, published: true },
          _avg: { rating: true },
          _count: { rating: true },
        }),
      'Calculate service rating stats',
    );

    if (result.success && result.data) {
      await executeQuery(
        () =>
          prisma.service.update({
            where: { id: serviceId },
            data: {
              rating: result.data!._avg.rating || 0,
              reviewCount: result.data!._count.rating,
            },
          }),
        'Update service rating',
      );
    }
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
}
