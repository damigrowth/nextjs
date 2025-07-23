/**
 * MAIN HOOKS INDEX
 * Centralized export point for all custom hooks organized by domain
 */

// Domain-specific hook exports
export * as authHooks from './auth';
export * as uiHooks from './ui';
export * as apiHooks from './api';
export * as adminHooks from './admin';
export * as chatHooks from './chat';

// Direct exports for commonly used hooks
export * from './auth';
export * from './ui';
export * from './api';