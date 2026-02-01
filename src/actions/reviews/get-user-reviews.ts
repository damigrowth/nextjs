'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma/client';
import { headers } from 'next/headers';
import type { ActionResult } from '@/lib/types/api';
import type { ReviewWithAuthor } from '@/lib/types/reviews';

// Get reviews given by the authenticated user
export async function getUserReviewsGiven(
  page: number = 1,
  limit: number = 10,
): Promise<ActionResult<{ reviews: ReviewWithAuthor[]; total: number }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Απαιτείται σύνδεση' };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          authorId: session.user.id,
          status: 'approved', // Only show approved reviews
          published: true,    // Only show published reviews
        },
        include: {
          profile: {
            select: {
              id: true,
              displayName: true,
              username: true,
              image: true, // String field, not a relation
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              displayName: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          authorId: session.user.id,
          status: 'approved',
          published: true,
        },
      }),
    ]);

    // Transform to match ReviewWithAuthor format
    const reviewsWithAuthor = reviews.map((review) => ({
      ...review,
      author: {
        id: review.author.id,
        name: review.author.name,
        displayName: review.author.displayName,
        username: review.author.username,
        image: null, // Author's own image (not needed in this context)
      },
      // Add the profile being reviewed as metadata
      reviewedProfile: {
        id: review.profile.id,
        displayName: review.profile.displayName || '',
        username: review.profile.username || '',
        image: review.profile.image,
      },
    }));

    return {
      success: true,
      data: {
        reviews: reviewsWithAuthor as any,
        total,
      },
    };
  } catch (error) {
    console.error('Get user reviews given error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης αξιολογήσεων',
    };
  }
}

// Get review statistics for the authenticated user's profile
export async function getUserReviewStats(): Promise<
  ActionResult<{ positiveCount: number; negativeCount: number }>
> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Απαιτείται σύνδεση' };
    }

    // Get user's profile
    const userProfile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
      select: { id: true },
    });

    if (!userProfile) {
      return { success: false, error: 'Το προφίλ δεν βρέθηκε' };
    }

    // Count positive (5-star) and negative (1-star) reviews
    const [positiveCount, negativeCount] = await Promise.all([
      prisma.review.count({
        where: {
          pid: userProfile.id,
          rating: 5,
          status: 'approved',
          published: true,
        },
      }),
      prisma.review.count({
        where: {
          pid: userProfile.id,
          rating: 1,
          status: 'approved',
          published: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        positiveCount,
        negativeCount,
      },
    };
  } catch (error) {
    console.error('Get user review stats error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης στατιστικών',
    };
  }
}

// Get reviews with comments (Recommendations) for the authenticated user's profile
export async function getUserReviewsWithComments(
  page: number = 1,
  limit: number = 10,
): Promise<ActionResult<{ reviews: ReviewWithAuthor[]; total: number }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Απαιτείται σύνδεση' };
    }

    // Get user's profile
    const userProfile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
      select: { id: true },
    });

    if (!userProfile) {
      return { success: false, error: 'Το προφίλ δεν βρέθηκε' };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          pid: userProfile.id,
          status: 'approved',
          published: true,
          comment: {
            not: null, // Only reviews WITH comments
          },
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          status: true,
          type: true,
          published: true,
          visibility: true, // Include visibility field for toggle
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
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
          pid: userProfile.id,
          status: 'approved',
          published: true,
          comment: {
            not: null,
          },
        },
      }),
    ]);

    // Get author profile images
    const reviewsWithImages = await Promise.all(
      reviews.map(async (review) => {
        const authorProfile = await prisma.profile.findUnique({
          where: { uid: review.author.id },
          select: {
            image: true,
          },
        });

        return {
          ...review,
          author: {
            ...review.author,
            image: authorProfile?.image || null,
          },
        };
      }),
    );

    return {
      success: true,
      data: {
        reviews: reviewsWithImages,
        total,
      },
    };
  } catch (error) {
    console.error('Get user reviews with comments error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης συστάσεων',
    };
  }
}

// Get review statistics for reviews GIVEN by the authenticated user
export async function getUserGivenReviewStats(): Promise<
  ActionResult<{ positiveCount: number; negativeCount: number }>
> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Απαιτείται σύνδεση' };
    }

    // Count positive (5-star) and negative (1-star) reviews given by the user
    const [positiveCount, negativeCount] = await Promise.all([
      prisma.review.count({
        where: {
          authorId: session.user.id,
          rating: 5,
          status: 'approved',
          published: true,
        },
      }),
      prisma.review.count({
        where: {
          authorId: session.user.id,
          rating: 1,
          status: 'approved',
          published: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        positiveCount,
        negativeCount,
      },
    };
  } catch (error) {
    console.error('Get user given review stats error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης στατιστικών',
    };
  }
}

// Get reviews with comments that were GIVEN by the authenticated user
export async function getUserGivenReviewsWithComments(
  page: number = 1,
  limit: number = 10,
): Promise<ActionResult<{ reviews: ReviewWithAuthor[]; total: number }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Απαιτείται σύνδεση' };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          authorId: session.user.id,
          status: 'approved',
          published: true,
          comment: {
            not: null, // Only reviews WITH comments
          },
        },
        include: {
          profile: {
            select: {
              id: true,
              displayName: true,
              username: true,
              image: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              displayName: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          authorId: session.user.id,
          status: 'approved',
          published: true,
          comment: {
            not: null,
          },
        },
      }),
    ]);

    // Transform to match ReviewWithAuthor format with reviewedProfile
    const reviewsWithProfiles = reviews.map((review) => ({
      ...review,
      author: {
        id: review.author.id,
        name: review.author.name,
        displayName: review.author.displayName,
        username: review.author.username,
        image: null,
      },
      reviewedProfile: {
        id: review.profile.id,
        displayName: review.profile.displayName || '',
        username: review.profile.username || '',
        image: review.profile.image,
      },
    }));

    return {
      success: true,
      data: {
        reviews: reviewsWithProfiles as any,
        total,
      },
    };
  } catch (error) {
    console.error('Get user given reviews with comments error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης συστάσεων',
    };
  }
}

// Get reviews received by the authenticated user's profile
export async function getUserReviewsReceived(
  page: number = 1,
  limit: number = 10,
): Promise<ActionResult<{ reviews: ReviewWithAuthor[]; total: number }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Απαιτείται σύνδεση' };
    }

    // Get user's profile
    const userProfile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
      select: { id: true },
    });

    if (!userProfile) {
      return { success: false, error: 'Το προφίλ δεν βρέθηκε' };
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          pid: userProfile.id,
          status: 'approved', // Only show approved reviews to profile owner
          published: true,
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
          pid: userProfile.id,
          status: 'approved', // Only count approved reviews
          published: true,
        },
      }),
    ]);

    // Get author profile images
    const reviewsWithImages = await Promise.all(
      reviews.map(async (review) => {
        const authorProfile = await prisma.profile.findUnique({
          where: { uid: review.author.id },
          select: {
            image: true, // String field, not a relation
          },
        });

        return {
          ...review,
          author: {
            ...review.author,
            image: authorProfile?.image || null,
          },
        };
      }),
    );

    return {
      success: true,
      data: {
        reviews: reviewsWithImages,
        total,
      },
    };
  } catch (error) {
    console.error('Get user reviews received error:', error);
    return {
      success: false,
      error: 'Αποτυχία λήψης αξιολογήσεων',
    };
  }
}
