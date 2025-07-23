/**
 * User Route Handlers
 * Following Hono docs with proper zValidator usage and AppError handling
 */

import { zValidator } from '@hono/zod-validator';
import { Prisma } from '@prisma/client';
import {
  userQuerySchema,
  idParamSchema,
  updateUserSchema,
  updateOnboardingSchema,
  typeParamSchema,
} from '@/lib/api/validations.ts';
import { executeQuery } from '@/lib/api/database.ts';
import { prisma } from '../../../../prisma/client.ts';
import {
  successResponse,
  paginatedResponse,
  withErrorHandling,
  validateUserType,
  validateResourceAccess,
} from '@/lib/api/error-handler.ts';
import { AppError } from '@/lib/errors';

/**
 * GET /users
 * Get all users with pagination, search, and filters
 */
const getUsersHandler = withErrorHandling(async (c: any) => {
  const { page, limit, search, type, confirmed, blocked, sort, order } =
    c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        {
          firstName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          lastName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          username: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          displayName: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    }),
    ...(type && {
      role: type.toLowerCase(),
    }),
    ...(confirmed !== undefined && { confirmed }),
    ...(blocked !== undefined && { blocked }),
  };

  const [usersResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            displayName: true,
            role: true,
            step: true,
            confirmed: true,
            blocked: true,
            banned: true,
            banReason: true,
            banExpires: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get users',
    ),
    executeQuery(() => prisma.user.count({ where }), 'Count users'),
  ]);

  if (!usersResult.success) {
    throw usersResult.error!;
  }

  if (!countResult.success) {
    throw countResult.error!;
  }

  const pagination = {
    page,
    limit,
    total: countResult.data!,
    hasNext: offset + limit < countResult.data!,
    hasPrev: page > 1,
  };

  return paginatedResponse(
    usersResult.data!,
    pagination,
    'Users retrieved successfully',
  );
}, 'Get users');

export const getUsers = [
  zValidator('query', userQuerySchema),
  getUsersHandler,
];

/**
 * GET /users/:id
 * Get user by ID
 */
const getUserByIdHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');

  const result = await executeQuery(
    () =>
      prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          displayName: true,
          role: true,
          step: true,
          confirmed: true,
          blocked: true,
          banned: true,
          banReason: true,
          banExpires: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    'Get user by ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('User not found');
  }

  return successResponse(result.data, 'User retrieved successfully');
}, 'Get user by ID');

export const getUserById = [
  zValidator('param', idParamSchema),
  getUserByIdHandler,
];

/**
 * PUT /users/me
 * Update current user profile
 */
const updateCurrentUserHandler = withErrorHandling(async (c: any) => {
  const user = c.get('user');
  const data = c.req.valid('json');

  const result = await executeQuery(
    () =>
      prisma.user.update({
        where: { id: user.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          displayName: true,
          role: true,
          step: true,
          confirmed: true,
          blocked: true,
          banned: true,
          emailVerified: true,
          updatedAt: true,
        },
      }),
    'Update current user',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    { user: result.data },
    'User updated successfully',
  );
}, 'Update current user');

export const updateCurrentUser = [
  zValidator('json', updateUserSchema),
  updateCurrentUserHandler,
];

/**
 * PATCH /users/onboarding-step
 * Update user onboarding step
 */
const updateOnboardingStepHandler = withErrorHandling(async (c: any) => {
  const user = c.get('user');
  const { step } = c.req.valid('json');

  const result = await executeQuery(
    () =>
      prisma.user.update({
        where: { id: user.id },
        data: {
          step,
        },
        select: {
          id: true,
          step: true,
          updatedAt: true,
        },
      }),
    'Update onboarding step',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    { user: result.data },
    'Onboarding step updated successfully',
  );
}, 'Update onboarding step');

export const updateOnboardingStep = [
  zValidator('json', updateOnboardingSchema),
  updateOnboardingStepHandler,
];

/**
 * PUT /users/:id
 * Update specific user (admin or owner only)
 */
const updateUserHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const updateData = c.req.valid('json');
  const currentUser = c.get('user');

  // Check if user can update this profile
  validateResourceAccess(id, currentUser);

  const result = await executeQuery(
    () =>
      prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          displayName: true,
          role: true,
          step: true,
          confirmed: true,
          blocked: true,
          banned: true,
          emailVerified: true,
          updatedAt: true,
        },
      }),
    'Update user',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'User updated successfully');
}, 'Update user');

export const updateUser = [
  zValidator('param', idParamSchema),
  zValidator('json', updateUserSchema),
  updateUserHandler,
];

/**
 * GET /users/by-type/:type
 * Get users by type (requires appropriate permissions)
 */
const getUsersByTypeHandler = withErrorHandling(async (c: any) => {
  const { type } = c.req.valid('param');
  const user = c.get('user');

  // Permission check - only companies and admins can view users by type
  if (user.role !== 'admin' && user.role !== 'company') {
    throw AppError.forbidden('Insufficient permissions');
  }

  const result = await executeQuery(
    () =>
      prisma.user.findMany({
        where: {
          role: type.toLowerCase(),
          blocked: false,
          confirmed: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          displayName: true,
          role: true,
          step: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    'Get users by type',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    { users: result.data },
    'Users retrieved successfully',
  );
}, 'Get users by type');

export const getUsersByType = [
  zValidator('param', typeParamSchema),
  getUsersByTypeHandler,
];

/**
 * DELETE /users/:id
 * Soft delete user (admin only)
 */
const deleteUserHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const currentUser = c.get('user');

  // Only admin can delete users
  if (currentUser.role !== 'admin') {
    throw AppError.forbidden('Only administrators can delete users');
  }

  const result = await executeQuery(
    () =>
      prisma.user.update({
        where: { id },
        data: {
          blocked: true,
        },
        select: {
          id: true,
          email: true,
          blocked: true,
          updatedAt: true,
        },
      }),
    'Soft delete user',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'User blocked successfully');
}, 'Delete user');

export const deleteUser = [
  zValidator('param', idParamSchema),
  deleteUserHandler,
];

/**
 * POST /users/:id/activate
 * Reactivate user (admin only)
 */
const activateUserHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const currentUser = c.get('user');

  // Only admin can activate users
  if (currentUser.role !== 'admin') {
    throw AppError.forbidden('Only administrators can activate users');
  }

  const result = await executeQuery(
    () =>
      prisma.user.update({
        where: { id },
        data: {
          blocked: false,
        },
        select: {
          id: true,
          email: true,
          blocked: true,
          updatedAt: true,
        },
      }),
    'Activate user',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'User activated successfully');
}, 'Activate user');

export const activateUser = [
  zValidator('param', idParamSchema),
  activateUserHandler,
];

/**
 * GET /users/me/stats
 * Get current user statistics
 */
export const getCurrentUserStats = withErrorHandling(async (c: any) => {
  const currentUser = c.get('user');

  // Fetch full user data from database
  const userResult = await executeQuery(
    () =>
      prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          name: true,
          displayName: true,
          username: true,
          step: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      }),
    'Get user for stats',
  );

  if (!userResult.success) {
    throw userResult.error!;
  }

  if (!userResult.data) {
    throw AppError.notFound('User not found');
  }

  const user = userResult.data;

  // Calculate stats based on your business logic
  const stats = {
    profileCompleteness: calculateProfileCompleteness(user),
    accountAge: Math.floor(
      (new Date().getTime() - new Date(user.createdAt).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
    lastLogin: user.updatedAt,
    onboardingProgress: {
      step: user.step,
      completed: user.step === 'DASHBOARD',
    },
  };

  return successResponse({ stats }, 'User statistics retrieved successfully');
}, 'Get user stats');

/**
 * Helper function to calculate profile completeness
 */
function calculateProfileCompleteness(user: any): number {
  const userFields = ['name', 'displayName', 'username'];
  const profileFields = user.profile ? ['firstName', 'lastName', 'phone'] : [];
  
  const completedUserFields = userFields.filter(
    (field) => user[field] && user[field].trim() !== '',
  ).length;
  
  const completedProfileFields = user.profile ? profileFields.filter(
    (field) => user.profile[field] && user.profile[field].trim() !== '',
  ).length : 0;
  
  const totalFields = userFields.length + profileFields.length;
  const completedFields = completedUserFields + completedProfileFields;
  
  return Math.round((completedFields / totalFields) * 100);
}
