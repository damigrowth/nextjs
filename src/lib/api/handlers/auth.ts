/**
 * Authentication Route Handlers
 * Following Hono docs with proper zValidator usage
 */

import { zValidator } from '@hono/zod-validator';
import { Context } from 'hono';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
  updateUserSchema,
} from '@/lib/validations';
import { auth } from '@/lib/auth';
import { executeQuery } from '@/lib/api/database';
import { PrismaClient } from '@prisma/client';
import { successResponse, withErrorHandling } from '@/lib/api/error-handler';
import { AppError } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * GET /auth/session
 * Get current session information
 */
export const getSession = withErrorHandling(async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return successResponse({ session: null, user: null });
  }

  return successResponse({
    session: session.session,
    user: session.user,
  });
}, 'Get session');

/**
 * POST /auth/signout
 * Sign out current user
 */
export const signOut = withErrorHandling(async (c) => {
  await auth.api.signOut({
    headers: c.req.raw.headers,
  });

  return successResponse({ message: 'Signed out successfully' });
}, 'Sign out');

/**
 * PATCH /auth/user-role
 * Update user role and additional info (after registration)
 */
const updateUserRoleHandler = withErrorHandling(async (c: any) => {
  const { role, username, displayName } = c.req.valid('json') as {
    role: string;
    username?: string;
    displayName?: string;
  };

  // Get current session to identify the user
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw AppError.unauthorized('Authentication required to update role');
  }

  // Validate role
  const validRoles = ['user', 'freelancer', 'company', 'admin'];
  if (!validRoles.includes(role)) {
    throw AppError.badRequest('Invalid role specified');
  }

  // Prepare update data
  const updateData: any = {
    role,
    step: 'EMAIL_VERIFICATION', // Set to EMAIL_VERIFICATION so they go through proper flow
  };

  // Add optional fields if provided
  if (username) {
    updateData.username = username;
  }
  if (displayName) {
    updateData.displayName = displayName;
  }

  const result = await executeQuery(
    () =>
      prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true,
          username: true,
          displayName: true,
          step: true,
          updatedAt: true,
        },
      }),
    'Update user role',
  );

  if (!result.success) {
    throw result.error!;
  }

  console.log('User role updated:', {
    userId: session.user.id,
    role,
    username,
    displayName,
    step: result.data.step,
  });

  return successResponse({
    user: result.data,
    message: 'User role updated successfully',
  });
}, 'Update user role');

export const updateUserType = [
  zValidator('json', updateUserSchema),
  updateUserRoleHandler,
];

/**
 * GET /auth/me
 * Get current authenticated user information
 */
export const getCurrentUser = withErrorHandling(async (c) => {
  const user = c.get('user');

  const result = await executeQuery(
    () =>
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          step: true,
          confirmed: true,
          blocked: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    'Get current user',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('User not found');
  }

  return successResponse({ user: result.data });
}, 'Get current user');

/**
 * POST /auth/verify-email
 * Request email verification for current user
 */
export const verifyEmail = withErrorHandling(async (c) => {
  const currentUser = c.get('user');

  if (currentUser.emailVerified) {
    return successResponse({ message: 'Email is already verified' });
  }

  // Use Better Auth to send verification email
  await auth.api.sendVerificationEmail({
    body: {
      email: currentUser.email,
    },
  });

  return successResponse({ message: 'Verification email sent successfully' });
}, 'Verify email');

/**
 * POST /auth/forgot-password
 * Request password reset
 */
const forgotPasswordHandler = withErrorHandling(async (c: any) => {
  const { email } = c.req.valid('json') as { email: string };

  try {
    // Use Better Auth forgot password functionality
    await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: `${process.env.BETTER_AUTH_URL}/reset-password`,
      },
    });
  } catch (error) {
    // Log error but don't reveal if email exists for security reasons
    console.error('Forgot password error:', error);
  }

  // Always return success for security
  return successResponse({
    message:
      'If an account with that email exists, a password reset link has been sent.',
  });
}, 'Forgot password');

export const forgotPassword = [
  zValidator('json', forgotPasswordSchema),
  forgotPasswordHandler,
];

/**
 * POST /auth/reset-password
 * Reset password using token
 */
const resetPasswordHandler = withErrorHandling(async (c: any) => {
  const { token, newPassword } = c.req.valid('json') as {
    token: string;
    newPassword: string;
  };

  // Use Better Auth reset password functionality
  await auth.api.resetPassword({
    body: {
      token,
      newPassword: newPassword,
    },
  });

  return successResponse({
    message: 'Password has been reset successfully',
  });
}, 'Reset password');

export const resetPassword = [
  zValidator('json', resetPasswordSchema),
  resetPasswordHandler,
];

/**
 * GET /auth/providers
 * Get available authentication providers
 */
export const getProviders = withErrorHandling(async (c) => {
  // Get configured providers from Better Auth
  const providers = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push({
      id: 'google',
      name: 'Google',
      type: 'oauth',
    });
  }

  // Email/password is always available
  providers.push({
    id: 'email',
    name: 'Email',
    type: 'credentials',
  });

  return successResponse({ providers });
}, 'Get providers');

/**
 * POST /auth/refresh
 * Refresh authentication session
 */
export const refreshSession = withErrorHandling(async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw AppError.unauthorized('Authentication required');
  }

  // Better Auth handles session refresh automatically
  return successResponse({
    session: session.session,
    user: session.user,
  });
}, 'Refresh session');
