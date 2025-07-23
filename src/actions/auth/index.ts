/**
 * AUTHENTICATION ACTIONS
 * Modern TypeScript server actions using Better Auth
 */

// Authentication actions
export * from './login';
export * from './register';
export * from './logout';
export * from './forgot-password';
export * from './reset-password';
export * from './verify-email';
export * from './change-password';
export * from './check-auth';
export * from './update-account';

// Legacy support - re-export with old names for backward compatibility
export { login as loginAction } from './login';
export { register as registerAction } from './register';
export { logout as logoutAction } from './logout';
export { forgotPassword as forgotPasswordAction } from './forgot-password';
export { resetPassword as resetPasswordAction } from './reset-password';
export { verifyEmail as verifyEmailAction } from './verify-email';
export { changePassword as changePasswordAction } from './change-password';
export { updateAccount as updateAccountAction } from './update-account';