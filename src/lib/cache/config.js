export const CACHE_CONFIG = {
  NO_CACHE: {
    key: null,
    ttl: 0, // No caching
  },
  USERS: {
    key: "users",
    ttl: 10 * 60, // 1 hour
  },
  SERVICES: {
    key: "services",
    ttl: 24 * 60 * 60, // 1 day
  },
  COLLECTIONS: {
    key: "collections",
    ttl: 7 * 24 * 60 * 60, // 1 week
  },
  ANALYTICS: {
    key: "analytics",
    ttl: 30 * 24 * 60 * 60, // 1 month
  },
  TOP: {
    key: "top",
    ttl: 24 * 60 * 60, // 1 day
  },
  HEADER: {
    key: "header",
    ttl: 24 * 60 * 60, // 1 day
  },
};
