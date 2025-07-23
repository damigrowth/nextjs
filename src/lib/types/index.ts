/**
 * MAIN TYPE DEFINITIONS INDEX
 * Centralized export point for all application types
 */

// Re-export all domain-specific types
export * from './auth';
export * from './user';
export * from './api';
export * from './components';

// Re-export existing types (keep compatibility)
export * from './profile';
export * from './service';
export * from './review';
export * from './chat';
export * from './database';

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireOnly<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ID types
export type ID = string;
export type UUID = string;
export type Timestamp = Date;

// Common enum types
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Form and validation types
export interface FormField<T = any> {
  name: string;
  value: T;
  error?: string;
  touched?: boolean;
  dirty?: boolean;
  valid?: boolean;
}

export interface FormState<T = any> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
}

// Error types
export interface AppError {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  stack?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  createdAt: Date;
  readAt?: Date;
}

// File and media types
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  path?: string;
  url?: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
}