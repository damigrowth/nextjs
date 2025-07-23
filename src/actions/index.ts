/**
 * MAIN ACTIONS INDEX
 * Centralized export point for all server actions
 */

// Domain-specific actions
export * as authActions from './auth';
export * as adminActions from './admin';
export * as userActions from './user';
export * as profileActions from './profile';
export * as sharedActions from './shared';

// Direct exports for common actions
export * from './auth';
export * from './shared';

// Legacy support - maintain existing patterns
export * from './profiles';
export * from './users';
export * from './services';
export * from './reviews';
export * from './chats';
export * from './messages';
export * from './media';