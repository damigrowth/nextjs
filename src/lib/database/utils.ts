import { Prisma } from '@prisma/client';

/**
 * Database utility functions to help with common Prisma query patterns
 */

/**
 * Creates a case-insensitive search filter for text fields
 * @param search - The search term
 * @param mode - Query mode (defaults to insensitive)
 * @returns Prisma filter object
 */
export const createTextFilter = (search: string, mode: Prisma.QueryMode = Prisma.QueryMode.insensitive) => ({
  contains: search,
  mode
});

/**
 * Creates a multi-field search filter with OR logic
 * @param search - The search term
 * @param fields - Array of field paths to search in
 * @returns Prisma OR filter object
 */
export const createMultiFieldSearch = (search: string, fields: string[]) => {
  return {
    OR: fields.map(field => {
      // Handle nested fields like 'user.displayName'
      const fieldParts = field.split('.');
      let filter: any = createTextFilter(search);
      
      // Build nested object for nested fields
      for (let i = fieldParts.length - 1; i >= 0; i--) {
        const newFilter: any = {};
        newFilter[fieldParts[i]] = filter;
        filter = newFilter;
      }
      
      return filter;
    })
  };
};

/**
 * Common search fields for different models
 */
export const SEARCH_FIELDS = {
  user: ['firstName', 'lastName', 'email', 'username', 'displayName'],
  profile: ['tagline', 'description', 'user.displayName', 'user.firstName', 'user.lastName'],
  service: ['title', 'description', 'tags'],
  review: ['comment'],
  message: ['content'],
  chat: ['name']
} as const;

/**
 * Helper to create search filters for common models
 */
export const createSearchFilter = (search: string, modelType: keyof typeof SEARCH_FIELDS) => {
  return createMultiFieldSearch(search, SEARCH_FIELDS[modelType]);
};

/**
 * Creates a range filter for numeric fields
 */
export const createRangeFilter = (min?: number, max?: number) => ({
  ...(min !== undefined && { gte: min }),
  ...(max !== undefined && { lte: max })
});

/**
 * Creates a date range filter
 */
export const createDateRangeFilter = (from?: Date, to?: Date) => ({
  ...(from && { gte: from }),
  ...(to && { lte: to })
});

/**
 * Type-safe query mode enum
 */
export const QueryMode = Prisma.QueryMode;
