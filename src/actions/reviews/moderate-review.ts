'use server';

import { prisma } from '@/lib/prisma/client';
import { moderateReviewSchema } from '@/lib/validations/review';
import { revalidateTag } from 'next/cache';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth } from '@/actions/auth/server';
import { CACHE_TAGS } from '@/lib/cache';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { updateProfileRating, updateServiceRating } from './update-rating';

/**
 * Admin action to moderate (approve/reject) a pending review
 * Includes automatic rating calculations on approval
 *
 * REQUIRES: Admin role
 */
export async function moderateReview(
  reviewId: string,
  status: 'approved' | 'rejected',
  reason?: string,
): Promise<ActionResponse> {
  try {
    // 1. Check authentication and admin role
    const session = await requireAuth();
    const user = session.user;

    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα πρόσβασης σε αυτή τη λειτουργία',
      };
    }

    // 2. Validate input
    const validationResult = moderateReviewSchema.safeParse({
      reviewId,
      status,
      reason,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return {
        success: false,
        message: firstError.message,
      };
    }

    // 3. Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        profile: {
          select: {
            id: true,
            username: true,
          },
        },
        service: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      return {
        success: false,
        message: 'Η αξιολόγηση δεν βρέθηκε',
      };
    }

    // 4. Check if review is already moderated
    if (review.status === 'approved' || review.status === 'rejected') {
      return {
        success: false,
        message: 'Η αξιολόγηση έχει ήδη ελεγχθεί',
      };
    }

    // 5. Handle approval or rejection
    if (status === 'approved') {
      // Approve review
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          status: 'approved',
          published: true,
        },
      });

      // Update profile rating using reusable function
      await updateProfileRating(review.pid);

      // If service review, update service rating too
      if (review.sid) {
        await updateServiceRating(review.sid);
      }
    } else {
      // Reject review (no rating updates)
      await prisma.review.update({
        where: { id: reviewId },
        data: {
          status: 'rejected',
          published: false,
        },
      });
    }

    // 6. Revalidate cache tags
    revalidateTag(CACHE_TAGS.review.byProfile(review.pid));
    revalidateTag(CACHE_TAGS.profile.byId(review.pid));
    revalidateTag(CACHE_TAGS.profile.byUsername(review.profile.username));
    revalidateTag(CACHE_TAGS.profile.page(review.profile.username));
    revalidateTag(CACHE_TAGS.review.byUser(review.authorId));

    if (review.sid && review.service?.slug) {
      revalidateTag(CACHE_TAGS.review.byService(review.sid));
      revalidateTag(CACHE_TAGS.service.byId(review.sid));
      revalidateTag(CACHE_TAGS.service.bySlug(review.service.slug));
      revalidateTag(CACHE_TAGS.service.page(review.service.slug));
    }

    // 7. Success response
    return {
      success: true,
      message:
        status === 'approved'
          ? 'Η αξιολόγηση εγκρίθηκε επιτυχώς'
          : 'Η αξιολόγηση απορρίφθηκε επιτυχώς',
    };
  } catch (error: any) {
    console.error('Moderate review error:', error);
    return handleBetterAuthError(error);
  }
}

/**
 * Get all pending reviews for admin moderation queue
 *
 * REQUIRES: Admin role
 */
export async function getPendingReviews(
  page: number = 1,
  limit: number = 20,
): Promise<
  ActionResponse<{
    reviews: any[];
    total: number;
  }>
> {
  try {
    // Check authentication and admin role
    const session = await requireAuth();
    const user = session.user;

    if (user.role !== 'admin') {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα πρόσβασης σε αυτή τη λειτουργία',
      };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          status: 'pending',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              displayName: true,
              username: true,
            },
          },
          profile: {
            select: {
              id: true,
              displayName: true,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          status: 'pending',
        },
      }),
    ]);

    return {
      success: true,
      message: '',
      data: {
        reviews,
        total,
      },
    };
  } catch (error) {
    console.error('Get pending reviews error:', error);
    return {
      success: false,
      message: 'Αποτυχία λήψης αξιολογήσεων',
    };
  }
}
