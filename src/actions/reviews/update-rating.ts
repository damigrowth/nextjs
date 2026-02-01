'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

/**
 * Reusable function to recalculate and update profile rating
 * Counts all approved + published reviews (ignores visibility per boss's instructions)
 *
 * Formula: averageRating = SUM(rating) / COUNT(reviews)
 * - Positive reviews = 5 stars
 * - Negative reviews = 1 star
 */
export async function updateProfileRating(profileId: string): Promise<void> {
  try {
    // Get profile for cache revalidation
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { id: true, username: true },
    });

    if (!profile) {
      console.error(`Profile not found: ${profileId}`);
      return;
    }

    // Fetch all approved + published reviews (ignore visibility)
    const profileReviews = await prisma.review.findMany({
      where: {
        pid: profileId,
        status: 'approved',
        published: true,
      },
      select: { rating: true },
    });

    // Calculate average rating
    const reviewCount = profileReviews.length;
    const avgRating =
      reviewCount > 0
        ? profileReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    // Update profile with new rating and count
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        rating: Number(avgRating.toFixed(2)),
        reviewCount,
      },
    });

    // Revalidate cache tags
    revalidateTag(CACHE_TAGS.profile.byId(profileId));
    if (profile.username) {
      revalidateTag(CACHE_TAGS.profile.byUsername(profile.username));
      revalidateTag(CACHE_TAGS.profile.page(profile.username));
    }
  } catch (error) {
    console.error(`Error updating profile rating for ${profileId}:`, error);
    // Don't throw - allow caller to continue
  }
}

/**
 * Reusable function to recalculate and update service rating
 * Counts all approved + published reviews (ignores visibility per boss's instructions)
 *
 * Formula: averageRating = SUM(rating) / COUNT(reviews)
 * - Positive reviews = 5 stars
 * - Negative reviews = 1 star
 */
export async function updateServiceRating(serviceId: number): Promise<void> {
  try {
    // Get service for cache revalidation
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, slug: true },
    });

    if (!service) {
      console.error(`Service not found: ${serviceId}`);
      return;
    }

    // Fetch all approved + published reviews (ignore visibility)
    const serviceReviews = await prisma.review.findMany({
      where: {
        sid: serviceId,
        status: 'approved',
        published: true,
      },
      select: { rating: true },
    });

    // Calculate average rating
    const reviewCount = serviceReviews.length;
    const avgRating =
      reviewCount > 0
        ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    // Update service with new rating and count
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        rating: Number(avgRating.toFixed(2)),
        reviewCount,
      },
    });

    // Revalidate cache tags
    revalidateTag(CACHE_TAGS.service.byId(serviceId));
    if (service.slug) {
      revalidateTag(CACHE_TAGS.service.bySlug(service.slug));
      revalidateTag(CACHE_TAGS.service.page(service.slug));
    }
  } catch (error) {
    console.error(`Error updating service rating for ${serviceId}:`, error);
    // Don't throw - allow caller to continue
  }
}
