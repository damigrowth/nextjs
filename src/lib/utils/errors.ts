/**
 * ERROR HANDLING UTILITIES
 * Centralized error handling and logging utilities
 */

import type { AppError, ValidationError } from '@/lib/types';

/**
 * Custom error classes
 */
export class AppErrorClass extends Error implements AppError {
  name = 'AppError';
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  cause?: Error;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      details?: Record<string, any>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    Object.setPrototypeOf(this, AppErrorClass.prototype);

    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
    this.cause = options.cause;
  }
}

export class ValidationErrorClass extends AppErrorClass implements ValidationError {
  name = 'ValidationError';
  field: string;
  value: any;
  rule: string;

  constructor(
    message: string,
    field: string,
    value: any,
    rule: string,
    options: {
      code?: string;
      statusCode?: number;
      details?: Record<string, any>;
    } = {}
  ) {
    super(message, { ...options, statusCode: options.statusCode || 400 });
    Object.setPrototypeOf(this, ValidationErrorClass.prototype);

    this.field = field;
    this.value = value;
    this.rule = rule;
  }
}

export class AuthErrorClass extends AppErrorClass {
  name = 'AuthError';
  type: 'unauthorized' | 'forbidden' | 'invalid_token' | 'expired_token';

  constructor(
    message: string,
    type: 'unauthorized' | 'forbidden' | 'invalid_token' | 'expired_token',
    options: {
      code?: string;
      statusCode?: number;
      details?: Record<string, any>;
    } = {}
  ) {
    super(message, { 
      ...options, 
      statusCode: options.statusCode || (type === 'forbidden' ? 403 : 401)
    });
    Object.setPrototypeOf(this, AuthErrorClass.prototype);

    this.type = type;
  }
}

/**
 * Error handling utilities
 */
export function createError(
  message: string,
  options?: {
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
    cause?: Error;
  }
): AppErrorClass {
  return new AppErrorClass(message, options);
}

export function createValidationError(
  message: string,
  field: string,
  value: any,
  rule: string,
  options?: {
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
  }
): ValidationErrorClass {
  return new ValidationErrorClass(message, field, value, rule, options);
}

export function createAuthError(
  message: string,
  type: 'unauthorized' | 'forbidden' | 'invalid_token' | 'expired_token',
  options?: {
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
  }
): AuthErrorClass {
  return new AuthErrorClass(message, type, options);
}

/**
 * Error type guards
 */
export function isAppError(error: unknown): error is AppErrorClass {
  return error instanceof AppErrorClass;
}

export function isValidationError(error: unknown): error is ValidationErrorClass {
  return error instanceof ValidationErrorClass;
}

export function isAuthError(error: unknown): error is AuthErrorClass {
  return error instanceof AuthErrorClass;
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Extract error code safely
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isAppError(error)) {
    return error.code;
  }
  
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String(error.code);
  }
  
  return undefined;
}

/**
 * Extract HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error) && error.statusCode) {
    return error.statusCode;
  }
  
  if (isValidationError(error)) {
    return 400;
  }
  
  if (isAuthError(error)) {
    return error.statusCode || 401;
  }
  
  return 500;
}

/**
 * Format error for client response
 */
export function formatErrorForClient(error: unknown) {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const statusCode = getErrorStatusCode(error);
  
  // Don't expose sensitive error details in production
  const details = process.env.NODE_ENV === 'development' && isAppError(error) 
    ? error.details 
    : undefined;
    
  return {
    success: false as const,
    error: message,
    code,
    statusCode,
    details,
  };
}

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context: {
    action?: string;
    userId?: string;
    request?: any;
    additional?: Record<string, any>;
  } = {}
) {
  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);
  
  console.error('Error occurred:', {
    message: errorMessage,
    code: errorCode,
    context,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or custom logging service
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: { action?: string; userId?: string }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Safe async function execution
 */
export async function safeAsync<T>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Create error response for server actions
 */
export function createErrorResponse(error: unknown, defaultMessage?: string) {
  const message = getErrorMessage(error) || defaultMessage || 'An unexpected error occurred';
  const code = getErrorCode(error);
  
  return {
    success: false as const,
    error: message,
    code,
  };
}

/**
 * Assert condition with custom error
 */
export function assert(
  condition: any,
  message: string,
  options?: {
    code?: string;
    statusCode?: number;
    details?: Record<string, any>;
  }
): asserts condition {
  if (!condition) {
    throw new AppErrorClass(message, options);
  }
}

/**
 * Assert authenticated user
 */
export function assertAuthenticated(
  user: any,
  message: string = 'Authentication required'
): asserts user {
  if (!user) {
    throw new AuthErrorClass(message, 'unauthorized');
  }
}

/**
 * Assert user has required role
 */
export function assertRole(
  user: { role?: string },
  requiredRoles: string | string[],
  message: string = 'Insufficient permissions'
): void {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  if (!user.role || !roles.includes(user.role)) {
    throw new AuthErrorClass(message, 'forbidden');
  }
}