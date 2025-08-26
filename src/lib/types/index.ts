/**
 * MAIN TYPE DEFINITIONS INDEX
 * Centralized export point for all application types
 */

// Re-export all domain-specific types
export * from './auth';
export * from './user';
export * from './api';
export * from './components';
export * from './email';

// Re-export existing types (keep compatibility)
export * from './profile';
export * from './service';
export * from './review';

// Error types
export interface AppError {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  stack?: string;
}
