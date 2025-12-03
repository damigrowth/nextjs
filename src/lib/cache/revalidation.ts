/**
 * Centralized cache revalidation utilities
 * Simplifies and standardizes cache invalidation across server actions
 */

import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_TAGS, getServiceTags, getProfileTags } from './index';

/**
 * Invalidate all caches related to a service mutation
 * Use this for: create, update, delete, toggle featured
 *
 * @example
 * await revalidateService({
 *   serviceId: newService.id,
 *   slug: newService.slug,
 *   pid: newService.pid,
 *   category: newService.category,
 *   userId: user.id,
 *   profileId: profile.id,
 *   profileUsername: profile.username,
 *   includeHome: newService.featured, // Only if featured
 * });
 */
export async function revalidateService(params: {
  serviceId: number;
  slug?: string | null;
  pid: string;
  category?: string | null;
  userId: string;
  profileId: string;
  profileUsername?: string | null;
  includeHome?: boolean; // For featured services
}) {
  const {
    serviceId,
    slug,
    pid,
    category,
    userId,
    profileId,
    profileUsername,
    includeHome = false
  } = params;

  // Service-specific tags
  const serviceTags = getServiceTags({ id: serviceId, slug, pid, category });
  serviceTags.forEach(tag => revalidateTag(tag));

  // Profile-related tags (service affects profile listings)
  revalidateTag(CACHE_TAGS.profile.byId(profileId));
  revalidateTag(CACHE_TAGS.profile.services(profileId));
  revalidateTag(CACHE_TAGS.user.services(userId));

  if (profileUsername) {
    revalidateTag(CACHE_TAGS.profile.byUsername(profileUsername));
    revalidateTag(CACHE_TAGS.profile.page(profileUsername));
  }

  // Archive/listing pages
  revalidateTag(CACHE_TAGS.archive.all);
  revalidateTag(CACHE_TAGS.archive.servicesFiltered);
  revalidateTag(CACHE_TAGS.collections.services);

  if (category) {
    revalidateTag(CACHE_TAGS.categories.category(category));
  }

  // Search
  revalidateTag(CACHE_TAGS.search.all);
  revalidateTag(CACHE_TAGS.search.taxonomies);

  // Home page (if featured service changed)
  if (includeHome) {
    revalidateTag(CACHE_TAGS.home);
    revalidatePath('/');
  }

  // Paths
  if (slug) {
    revalidatePath(`/s/${slug}`);
  }
  if (profileUsername) {
    revalidatePath(`/profile/${profileUsername}`);
  }
  revalidatePath('/ipiresies');
  revalidatePath('/categories');
  revalidateTag(CACHE_TAGS.categories.all);
}

/**
 * Invalidate all caches related to a profile mutation
 * Use this for: update basic info, presentation, portfolio, coverage, billing, additional info
 *
 * @example
 * await revalidateProfile({
 *   profileId: profile.id,
 *   userId: user.id,
 *   username: profile.username,
 *   category: profile.category,
 *   includeHome: profile.featured, // Only if featured
 *   includeServices: true,
 * });
 */
export async function revalidateProfile(params: {
  profileId: string;
  userId: string;
  username?: string | null;
  category?: string | null;
  includeHome?: boolean; // For featured profiles
  includeServices?: boolean; // When profile data affects services
}) {
  const {
    profileId,
    userId,
    username,
    category,
    includeHome = false,
    includeServices = true
  } = params;

  // Profile-specific tags
  const profileTags = getProfileTags({ id: profileId, uid: userId, username });
  profileTags.forEach(tag => revalidateTag(tag));

  // User tags
  revalidateTag(CACHE_TAGS.user.byId(userId));
  revalidateTag(CACHE_TAGS.user.profile(userId));

  // Services (profile changes affect service listings)
  if (includeServices) {
    revalidateTag(CACHE_TAGS.user.services(userId));
    revalidateTag(CACHE_TAGS.profile.services(profileId));
    revalidateTag(CACHE_TAGS.service.byProfile(profileId));
  }

  // Archive/listing pages
  revalidateTag(CACHE_TAGS.archive.all);
  revalidateTag(CACHE_TAGS.collections.profiles);
  revalidateTag(CACHE_TAGS.directory.all);

  if (category) {
    revalidateTag(CACHE_TAGS.directory.category(category));
  }

  // Home page (if featured profile changed)
  if (includeHome) {
    revalidateTag(CACHE_TAGS.home);
    revalidatePath('/');
  }

  // Paths
  if (username) {
    revalidatePath(`/profile/${username}`);
  }
  revalidatePath('/dir');
}

/**
 * Invalidate review-related caches
 * Use this for: create, update, delete reviews
 *
 * @example
 * await revalidateReview({
 *   reviewId: review.id,
 *   serviceId: review.serviceId,
 *   profileId: review.profileId,
 *   userId: user.id,
 * });
 */
export async function revalidateReview(params: {
  reviewId: number;
  serviceId?: number | null;
  profileId: string;
  userId: string;
}) {
  const { reviewId, serviceId, profileId, userId } = params;

  // Review tags
  revalidateTag(CACHE_TAGS.review.byId(reviewId));
  revalidateTag(CACHE_TAGS.review.byProfile(profileId));
  revalidateTag(CACHE_TAGS.review.byUser(userId));

  if (serviceId) {
    revalidateTag(CACHE_TAGS.review.byService(serviceId));
    revalidateTag(CACHE_TAGS.service.byId(serviceId));
  }

  // Profile rating changed - affects all profile displays
  revalidateTag(CACHE_TAGS.profile.byId(profileId));

  // Could affect home page if rating changed for featured items
  revalidateTag(CACHE_TAGS.home);

  // Archive pages (reviews affect sorting)
  revalidateTag(CACHE_TAGS.archive.all);
}

/**
 * Log cache revalidation for monitoring (development/production)
 */
export function logCacheRevalidation(
  type: 'service' | 'profile' | 'review',
  id: string | number,
  context?: string
) {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_LOG_CACHE === 'true') {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` (${context})` : '';
    console.log(`[Cache Revalidation] ${type}:${id}${contextStr} at ${timestamp}`);
  }
}
