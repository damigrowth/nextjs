/**
 * Centralized Prisma SELECT constants for Saved Items queries
 *
 * These INCLUDE statements optimize data transfer for saved services and profiles
 * by fetching only required fields for dashboard display.
 *
 * Used in: /dashboard/saved
 */

/**
 * Saved Service with minimal Profile data
 * Used for displaying saved service cards with provider info
 */
export const SAVED_SERVICE_INCLUDE = {
  service: {
    include: {
      profile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          image: true,
        },
      },
    },
  },
} as const;

/**
 * Saved Profile with User role
 * Used for displaying saved profile cards with role information
 */
export const SAVED_PROFILE_INCLUDE = {
  profile: {
    include: {
      user: {
        select: {
          role: true,
        },
      },
    },
  },
} as const;


