export const CACHE_CONFIG = {
  NO_CACHE: {
    key: null,
    ttl: 0, // No caching
  },
  // SECURITY WARNING: User-specific data should NEVER be cached
  // The USERS cache is DISABLED to prevent cross-user data leakage
  USERS: {
    key: null, // DISABLED - was 'users'
    ttl: 0, // DISABLED - was 300 (5 minutes)
  },
  SERVICES: {
    key: 'services',
    ttl: 600, // 10 minutes
  },
  ANALYTICS: {
    key: 'analytics',
    ttl: 3600, // 1 hour
  },
  TOP: {
    key: 'top',
    ttl: 1800, // 30 minutes
  },
  HEADER: {
    key: 'header',
    ttl: 1800, // 30 minutes
  },
  HOME_PAGE: {
    key: 'home-page',
    ttl: 900, // 15 minutes - matches page revalidation for featured content
  },
  SAVED_STATUS: {
    key: null, // SECURITY: Don't cache user-specific saved status
    ttl: 0, // No caching for user-specific data
  },
};
