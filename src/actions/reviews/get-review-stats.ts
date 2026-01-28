'use server';

import { prisma } from '@/lib/prisma/client';
import type { ActionResult } from '@/lib/types/api';
import type { ReviewStats } from '@/lib/types/reviews';

// Get review statistics for a profile
export async function getProfileReviewStats(
  profileId: string,
): Promise<ActionResult<ReviewStats>> {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        pid: profileId,
        status: 'approved', // Only count approved reviews
        published: true,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            ).toFixed(1),
          )
        : 0;

    return {
      success: true,
      data: {
        totalReviews,
        averageRating,
      },
    };
  } catch (error) {
    console.error('Get profile review stats error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης στατιστικών αξιολόγησης',
    };
  }
}

// Get review statistics for a service
export async function getServiceReviewStats(
  serviceId: number,
): Promise<ActionResult<ReviewStats>> {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        sid: serviceId,
        status: 'approved', // Only count approved reviews
        published: true,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((sum, review) => sum + review.rating, 0) /
              totalReviews
            ).toFixed(1),
          )
        : 0;

    return {
      success: true,
      data: {
        totalReviews,
        averageRating,
      },
    };
  } catch (error) {
    console.error('Get service review stats error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης στατιστικών αξιολόγησης',
    };
  }
}
