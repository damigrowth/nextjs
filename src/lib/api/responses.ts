/**
 * API Response utilities
 * Standardized response formatters for consistent API responses
 */

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;
  code?: string;
  errors?: Array<{ field: string; message: string; received?: any }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  timestamp: string;
  details?: any; // For development mode errors
}

/**
 * Success response formatter
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @returns {Response} Formatted success response
 */
export function successResponse<T>(
  data: T | null = null,
  message: string = 'Success',
  status: number = 200,
): Response {
  return Response.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}



interface PaginationInfo {
  page?: number;
  limit?: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Paginated response formatter
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 * @returns {Response} Formatted paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationInfo,
  message: string = 'Success',
): Response {
  return Response.json(
    {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: Math.ceil(
          (pagination.total || 0) / (pagination.limit || 10),
        ),
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
