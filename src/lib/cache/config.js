export const CACHE_CONFIG = {
  NO_CACHE: {
    key: null,
    ttl: 0, // No caching
  },
  USERS: {
    key: "users",
    ttl: 300, // 5 minutes
  },
  SERVICES: {
    key: "services",
    ttl: 600, // 10 minutes
  },
  HOME_SERVICES: {
    key: "home-services",
    ttl: 300, // 5 minutes
  },
  HOME_FREELANCERS: {
    key: "home-freelancers",
    ttl: 300, // 5 minutes
  },
  FEATURED_CATEGORIES: {
    key: "featured-categories",
    ttl: 900, // 15 minutes
  },
  COLLECTIONS: {
    key: "collections",
    ttl: 3600, // 1 hour
  },
  ANALYTICS: {
    key: "analytics",
    ttl: 3600, // 1 hour
  },
  TOP: {
    key: "top",
    ttl: 1800, // 30 minutes
  },
  ACTIVE_TOP: {
    key: "active-top",
    ttl: 900, // 15 minutes
  },
  HEADER: {
    key: "header",
    ttl: 1800, // 30 minutes
  },
  SAVED_STATUS: {
    key: "saved-status",
    ttl: 0, // 0 minute
  },
};
