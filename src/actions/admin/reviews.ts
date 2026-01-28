'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import {
  adminListReviewsSchema,
  adminUpdateReviewStatusSchema,
  adminDeleteReviewSchema,
  type AdminListReviewsInput,
  type AdminUpdateReviewStatusInput,
  type AdminDeleteReviewInput,
} from '@/lib/validations/admin';
import { getAdminSession, getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { updateProfileRating, updateServiceRating } from '../reviews/update-rating';

/**
 * List reviews with filters and pagination
 */
export async function listReviews(
  params: Partial<AdminListReviewsInput> = {},
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.REVIEWS, 'view');

    const validatedParams = adminListReviewsSchema.parse(params);

    const {
      searchQuery,
      status,
      rating,
      type,
      limit,
      offset,
      sortBy,
      sortDirection,
    } = validatedParams;

    // Build where clause
    const where: any = {};

    // Search filter (comment text or author name/email)
    if (searchQuery) {
      where.OR = [
        { comment: { contains: searchQuery, mode: 'insensitive' } },
        {
          author: {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
              { displayName: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Rating filter
    if (rating && rating !== 'all') {
      where.rating = parseInt(rating);
    }

    // Type filter
    if (type && type !== 'all') {
      where.type = type;
    }

    // Execute query
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              displayName: true,
              image: true,
            },
          },
          profile: {
            select: {
              id: true,
              displayName: true,
              image: true,
              username: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortDirection,
        },
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      success: true,
      data: {
        reviews,
        total,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error('Error listing reviews:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list reviews',
    };
  }
}

/**
 * Get single review with full details
 */
export async function getReview(reviewId: string) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.REVIEWS, 'view');

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            displayName: true,
            image: true,
            role: true,
          },
        },
        profile: {
          select: {
            id: true,
            displayName: true,
            username: true,
            image: true,
            type: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      return {
        success: false,
        error: 'Review not found',
      };
    }

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error('Error fetching review:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch review',
    };
  }
}

/**
 * Update review status (Approve or Reject)
 */
export async function updateReviewStatus(
  params: AdminUpdateReviewStatusInput,
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.REVIEWS, 'edit');

    const validatedParams = adminUpdateReviewStatusSchema.parse(params);

    const { reviewId, status, notes } = validatedParams;

    // Get current review data before update to check if status is changing
    const currentReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        status: true,
        pid: true,
        sid: true,
      },
    });

    if (!currentReview) {
      return {
        success: false,
        error: 'Review not found',
      };
    }

    // Determine published field based on status
    const published = status === 'approved';

    // Update review status
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        published, // Sync published with status
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        profile: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    // Recalculate ratings if status changed to/from approved
    const statusChanged = currentReview.status !== status;
    const involvesApproved =
      status === 'approved' || currentReview.status === 'approved';

    if (statusChanged && involvesApproved) {
      // Update profile rating
      await updateProfileRating(currentReview.pid);

      // If service review, update service rating too
      if (currentReview.sid) {
        await updateServiceRating(currentReview.sid);
      }
    }

    // TODO: Create audit log entry if you have an audit log system
    // TODO: Send email notification to review author about status change

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error('Error updating review status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update review status',
    };
  }
}

/**
 * Delete review
 */
export async function deleteReview(params: AdminDeleteReviewInput) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.REVIEWS, 'full');

    const validatedParams = adminDeleteReviewSchema.parse(params);
    const { reviewId } = validatedParams;

    // Get review data before deletion to check if ratings need recalculation
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        status: true,
        published: true,
        pid: true,
        sid: true,
      },
    });

    if (!review) {
      return {
        success: false,
        error: 'Review not found',
      };
    }

    // Check if this review was contributing to ratings
    const wasApprovedAndPublished =
      review.status === 'approved' && review.published;

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate ratings if deleted review was approved+published
    if (wasApprovedAndPublished) {
      // Update profile rating
      await updateProfileRating(review.pid);

      // If service review, update service rating too
      if (review.sid) {
        await updateServiceRating(review.sid);
      }
    }

    return {
      success: true,
      data: { id: reviewId },
    };
  } catch (error) {
    console.error('Error deleting review:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete review',
    };
  }
}

/**
 * Get review statistics
 */
export async function getReviewStats() {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.REVIEWS, 'view');

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { status: 'pending' } }),
      prisma.review.count({ where: { status: 'approved' } }),
      prisma.review.count({ where: { status: 'rejected' } }),
    ]);

    return {
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
      },
    };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch review stats',
    };
  }
}

/**
 * Toggle review visibility (admin control)
 */
export async function toggleAdminReviewVisibility(reviewId: string) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.REVIEWS, 'edit');

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, visibility: true },
    });

    if (!review) {
      return {
        success: false,
        error: 'Review not found',
      };
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { visibility: !review.visibility },
    });

    return {
      success: true,
      data: { visibility: updatedReview.visibility },
      message: updatedReview.visibility
        ? 'Review is now visible'
        : 'Review is now hidden',
    };
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle visibility',
    };
  }
}

/**
 * Update review status - FormData version for useActionState
 */
export async function updateReviewStatusAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const reviewId = formData.get('reviewId');
    const status = formData.get('status');
    const notes = formData.get('notes');

    if (!reviewId || !status) {
      return {
        success: false,
        error: 'Review ID and status are required',
      };
    }

    // Parse and validate
    const rawData = {
      reviewId: reviewId as string,
      status: status as string,
      notes: notes ? (notes as string) : undefined,
    };

    const validationResult = adminUpdateReviewStatusSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error:
          'Validation failed: ' +
          validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateReviewStatus(validationResult.data);
    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update review status',
    };
  }
}
