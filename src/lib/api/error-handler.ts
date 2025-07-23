/**
 * Error Handler Utility
 * Centralized error handling for API routes
 */

import { AppError } from '@/lib/errors';
import { Context } from 'hono';

/**
 * Standard error response handler
 * @param error - The error to handle
 * @param c - Hono context
 * @param operation - Description of the operation that failed
 * @returns Response object
 */
export function handleApiError(
  error: any,
  c: Context,
  operation: string = 'Operation',
): Response {
  console.error(`${operation} failed:`, error);

  // If it's already an AppError, return its response
  if (error instanceof AppError) {
    return Response.json(error.toResponse(), {
      status: error.statusCode,
    });
  }

  // Handle Prisma errors
  if (error.code && typeof error.code === 'string') {
    const prismaError = AppError.fromPrismaError(error);
    return Response.json(prismaError.toResponse(), {
      status: prismaError.statusCode,
    });
  }

  // Handle validation errors from Zod
  if (error.name === 'ZodError') {
    const validationError = AppError.badRequest(
      'Validation failed',
      {
        validationErrors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          received: err.received,
        })),
      },
    );
    return Response.json(validationError.toResponse(), {
      status: validationError.statusCode,
    });
  }

  // Handle Better Auth errors
  if (error.message && typeof error.message === 'string') {
    if (error.message.includes('Invalid identifier') || 
        error.message.includes('Invalid password')) {
      const authError = AppError.unauthorized('Invalid identifier or password');
      return Response.json(authError.toResponse(), {
        status: authError.statusCode,
      });
    }

    if (error.message.includes('Email already exists') ||
        error.message.includes('Username already taken')) {
      const conflictError = AppError.conflict('Email or Username are already taken');
      return Response.json(conflictError.toResponse(), {
        status: conflictError.statusCode,
      });
    }

    if (error.message.includes('Token') && error.message.includes('expired')) {
      const tokenError = AppError.badRequest('Token has expired');
      return Response.json(tokenError.toResponse(), {
        status: tokenError.statusCode,
      });
    }
  }

  // Default internal server error
  const internalError = AppError.internal('Internal server error', {
    originalError: error.message,
    operation,
  });

  return Response.json(internalError.toResponse(), {
    status: internalError.statusCode,
  });
}

/**
 * Async error wrapper for API handlers
 * @param handler - The API handler function
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(
  handler: (c: Context) => Promise<Response>,
  operation: string = 'API Operation',
) {
  return async (c: Context): Promise<Response> => {
    try {
      return await handler(c);
    } catch (error) {
      return handleApiError(error, c, operation);
    }
  };
}

/**
 * Check if user owns resource
 * @param resourceUserId - User ID that owns the resource
 * @param currentUserId - Current user ID
 * @param currentUserRole - Current user role
 * @returns boolean
 */
export function canAccessResource(
  resourceUserId: string,
  currentUserId: string,
  currentUserRole: string = 'user',
): boolean {
  return resourceUserId === currentUserId || currentUserRole === 'admin';
}

/**
 * Validate user permissions for operation
 * @param requiredRoles - Array of allowed user roles
 * @param currentUserRole - Current user's role
 * @throws AppError if not authorized
 */
export function validateUserRole(
  requiredRoles: string[],
  currentUserRole: string,
): void {
  if (!requiredRoles.includes(currentUserRole)) {
    throw AppError.forbidden('You are not allowed to perform this action');
  }
}

// Keep old function for backward compatibility (mark as deprecated)
/** @deprecated Use validateUserRole instead */
export function validateUserType(
  requiredTypes: number[],
  currentUserType: number,
): void {
  // Map old numeric types to new string roles for compatibility
  const roleMap: Record<number, string> = {
    0: 'admin',
    1: 'user', 
    2: 'freelancer',
    3: 'company'
  };
  
  const requiredRoles = requiredTypes.map(type => roleMap[type]).filter(Boolean);
  const currentRole = roleMap[currentUserType] || 'user';
  
  validateUserRole(requiredRoles, currentRole);
}

/**
 * Validate user can perform action on resource
 * @param resourceOwnerId - ID of user who owns the resource
 * @param currentUser - Current user object
 * @throws AppError if not authorized
 */
export function validateResourceAccess(
  resourceOwnerId: string,
  currentUser: { id: string; role: string },
): void {
  if (!canAccessResource(resourceOwnerId, currentUser.id, currentUser.role)) {
    throw AppError.forbidden('Access denied');
  }
}

/**
 * Success response helper using AppError pattern
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code
 * @returns Response object
 */
export function successResponse<T>(
  data: T | null = null,
  message: string = 'Success',
  statusCode: number = 200,
): Response {
  return Response.json(
    {
      success: true,
      message: AppError.translate(message),
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}

/**
 * Paginated success response helper
 * @param data - Data array
 * @param pagination - Pagination info
 * @param message - Success message
 * @returns Response object
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message: string = 'Success',
): Response {
  return Response.json(
    {
      success: true,
      message: AppError.translate(message),
      data,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
