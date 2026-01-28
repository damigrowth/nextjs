'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { CACHE_TAGS } from '@/lib/cache';
import type { ReviewWithAuthor } from '@/lib/types/reviews';

/**
 * Internal function to fetch profile reviews
 * Cached with profile review tags
 */
async function _getProfileReviews(
  profileId: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        pid: profileId,
        status: 'approved', // Only show approved reviews
        published: true,
        visibility: true, // Only show visible comments
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
        pid: profileId,
        status: 'approved', // Only count approved reviews
        published: true,
        visibility: true, // Only count visible comments
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

  return { reviews: reviewsWithImages, total };
}

/**
 * Get reviews for a profile with caching
 */
export async function getProfileReviews(
  profileId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ActionResponse<{ reviews: ReviewWithAuthor[]; total: number }>> {
  try {
    const getCachedReviews = unstable_cache(
      _getProfileReviews,
      [`profile-reviews-${profileId}-${page}-${limit}`],
      {
        tags: [
          CACHE_TAGS.review.byProfile(profileId),
          CACHE_TAGS.profile.byId(profileId),
        ],
        revalidate: 300, // 5 minutes
      },
    );

    const data = await getCachedReviews(profileId, page, limit);

    return {
      success: true,
      message: '',
      data,
    };
  } catch (error) {
    console.error('Get profile reviews error:', error);
    return {
      success: false,
      message: 'Αποτυχία λήψης αξιολογήσεων',
    };
  }
}

/**
 * Internal function to fetch service reviews
 * Cached with service review tags
 */
async function _getServiceReviews(
  serviceId: number,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        sid: serviceId,
        status: 'approved', // Only show approved reviews
        published: true,
        visibility: true, // Only show visible comments
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({
      where: {
        sid: serviceId,
        status: 'approved', // Only count approved reviews
        published: true,
        visibility: true, // Only count visible comments
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
        service: null, // Service reviews don't need service info
      };
    }),
  );

  return { reviews: reviewsWithImages, total };
}

/**
 * Get reviews for a service with caching
 */
export async function getServiceReviews(
  serviceId: number,
  page: number = 1,
  limit: number = 10,
): Promise<ActionResponse<{ reviews: ReviewWithAuthor[]; total: number }>> {
  try {
    const getCachedReviews = unstable_cache(
      _getServiceReviews,
      [`service-reviews-${serviceId}-${page}-${limit}`],
      {
        tags: [
          CACHE_TAGS.review.byService(serviceId),
          CACHE_TAGS.service.byId(serviceId),
        ],
        revalidate: 300, // 5 minutes
      },
    );

    const data = await getCachedReviews(serviceId, page, limit);

    return {
      success: true,
      message: '',
      data,
    };
  } catch (error) {
    console.error('Get service reviews error:', error);
    return {
      success: false,
      message: 'Αποτυχία λήψης αξιολογήσεων',
    };
  }
}

/**
 * Internal function to fetch profile's other service reviews
 * Cached with profile review tags
 */
async function _getProfileOtherServiceReviews(
  profileId: string,
  excludeServiceId: number | undefined,
  limit: number,
) {
  const where: any = {
    pid: profileId,
    status: 'approved',
    published: true,
    visibility: true, // Only show visible comments
    sid: { not: null },
  };

  if (excludeServiceId !== undefined) {
    where.sid.not = excludeServiceId;
  }

  const reviews = await prisma.review.findMany({
    where,
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
    take: limit,
  });

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

  return { reviews: reviewsWithImages, total: reviewsWithImages.length };
}

/**
 * Get other service reviews from the same profile with caching
 * Excludes the current service to show reviews for other services
 */
export async function getProfileOtherServiceReviews(
  profileId: string,
  excludeServiceId?: number,
  limit: number = 5,
): Promise<ActionResponse<{ reviews: ReviewWithAuthor[]; total: number }>> {
  try {
    const getCachedReviews = unstable_cache(
      _getProfileOtherServiceReviews,
      [`profile-other-reviews-${profileId}-${excludeServiceId}-${limit}`],
      {
        tags: [
          CACHE_TAGS.review.byProfile(profileId),
          CACHE_TAGS.profile.byId(profileId),
        ],
        revalidate: 300, // 5 minutes
      },
    );

    const data = await getCachedReviews(profileId, excludeServiceId, limit);

    return {
      success: true,
      message: '',
      data,
    };
  } catch (error) {
    console.error('Get profile other service reviews error:', error);
    return {
      success: false,
      message: 'Αποτυχία λήψης αξιολογήσεων',
    };
  }
}
