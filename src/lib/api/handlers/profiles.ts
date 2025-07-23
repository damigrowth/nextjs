/**
 * Profile Route Handlers - CORRECTED FOR ACTUAL PRISMA SCHEMA
 * Following Hono docs with proper zValidator usage and AppError handling
 */

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  createProfileSchema,
  updateProfileSchema,
  profileQuerySchema,
  idParamSchema,
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
 * GET /profiles
 * Get all profiles with pagination and filters
 */const getProfilesHandler = withErrorHandling(async (c: any) => {
  const {
    page,
    limit,
    search,
    type,
    verified,
    featured,
    published,
    minRate,
    maxRate,
    city,
    county,
    sort,
    order,
  } = c.req.valid('query');
  const offset = (page - 1) * limit;

  // Build user conditions separately to avoid conflicts
  const userConditions: any = {};
  
  // Add search conditions to user if needed
  if (search) {
    userConditions.OR = [
      {
        name: {
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
      {
        username: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    ];
  }

  const where = {
    published: published !== undefined ? published : true,
    ...(search && {
      OR: [
        { tagline: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        { skills: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { displayName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ...(Object.keys(userConditions).length > 0 ? [{ user: userConditions }] : []),
      ],
    }),
    ...(city && { city: { contains: city, mode: Prisma.QueryMode.insensitive } }),
    ...(county && { county: { contains: county, mode: Prisma.QueryMode.insensitive } }),
    ...(type !== undefined && { type }),
    ...(verified !== undefined && { verified }),
    ...(featured !== undefined && { featured }),
    ...(minRate && { rate: { gte: minRate } }),
    ...(maxRate && { rate: { lte: maxRate } }),
  };

  const [profilesResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.profile.findMany({
          where,
          select: {
            id: true,
            uid: true,
            type: true,
            tagline: true,
            description: true,
            skills: true,
            experience: true,
            rate: true,
            verified: true,
            featured: true,
            published: true,
            rating: true,
            reviewCount: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                displayName: true,
                username: true,
                image: true,
                role: true,
                confirmed: true,
              },
            },
            image: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
            _count: {
              select: {
                services: {
                  where: { published: true },
                },
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get profiles',
    ),
    executeQuery(() => prisma.profile.count({ where }), 'Count profiles'),
  ]);

  if (!profilesResult.success) {
    throw profilesResult.error!;
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
    profilesResult.data!,
    pagination,
    'Profiles retrieved successfully',
  );
}, 'Get profiles');

export const getProfiles = [
  zValidator('query', profileQuerySchema),
  getProfilesHandler,
];

/**
 * GET /profiles/:id
 * Get profile by ID
 */
const getProfileByIdHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');

  const result = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { id },
        select: {
          id: true,
          uid: true,
          type: true,
          tagline: true,
          description: true,
          skills: true,
          experience: true,
          rate: true,
          website: true,
          verified: true,
          featured: true,
          published: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              username: true,
              email: true,
              image: true,
              role: true,
              confirmed: true,
            },
          },
          image: {
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
          services: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              category: true,
              pricingType: true,
              published: true,
              featured: true,
              rating: true,
              reviewCount: true,
              createdAt: true,
              media: {
                select: {
                  id: true,
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
            where: { published: true },
            orderBy: { createdAt: 'desc' },
          },
          reviewsReceived: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  username: true,
                  image: true,
                },
              },
            },
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      }),
    'Get profile by ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Profile not found');
  }

  return successResponse(result.data, 'Profile retrieved successfully');
}, 'Get profile by ID');

export const getProfileById = [
  zValidator('param', idParamSchema),
  getProfileByIdHandler,
];

/**
 * POST /profiles
 * Create new profile
 */
const createProfileHandler = withErrorHandling(async (c: any) => {
  const profileData = c.req.valid('json');
  const user = c.get('user');

  // Check if user can create profile (freelancers and companies)
  if (user.role !== 'freelancer' && user.role !== 'company') {
    throw AppError.forbidden('Only freelancers and companies can create profiles');
  }

  // Check if user already has a profile
  const existingProfileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Check existing profile',
  );

  if (!existingProfileResult.success) {
    throw existingProfileResult.error!;
  }

  if (existingProfileResult.data) {
    throw AppError.conflict('User already has a profile');
  }

  const result = await executeQuery(
    () =>
      prisma.profile.create({
        data: {
          ...profileData,
          uid: user.id,
          type: user.role, // Set profile type based on user role
        },
        select: {
          id: true,
          uid: true,
          type: true,
          tagline: true,
          description: true,
          skills: true,
          experience: true,
          rate: true,
          published: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              username: true,
              image: true,
            },
          },
        },
      }),
    'Create profile',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Profile created successfully', 201);
}, 'Create profile');

export const createProfile = [
  zValidator('json', createProfileSchema),
  createProfileHandler,
];

/**
 * PUT /profiles/:id
 * Update profile
 */
const updateProfileHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const profileData = c.req.valid('json');
  const user = c.get('user');

  // Check if profile exists and user owns it
  const existingProfileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { id },
        select: {
          uid: true,
        },
      }),
    'Check profile ownership',
  );

  if (!existingProfileResult.success) {
    throw existingProfileResult.error!;
  }

  if (!existingProfileResult.data) {
    throw AppError.notFound('Profile not found');
  }

  validateResourceAccess(existingProfileResult.data.uid, user);

  const result = await executeQuery(
    () =>
      prisma.profile.update({
        where: { id },
        data: profileData,
        select: {
          id: true,
          uid: true,
          type: true,
          tagline: true,
          description: true,
          skills: true,
          experience: true,
          rate: true,
          website: true,
          verified: true,
          featured: true,
          published: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              displayName: true,
              username: true,
              image: true,
            },
          },
        },
      }),
    'Update profile',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Profile updated successfully');
}, 'Update profile');

export const updateProfile = [
  zValidator('param', idParamSchema),
  zValidator('json', updateProfileSchema),
  updateProfileHandler,
];

/**
 * DELETE /profiles/:id
 * Delete profile (soft delete by unpublishing)
 */
const deleteProfileHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // Check if profile exists and user owns it
  const existingProfileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { id },
        select: {
          uid: true,
        },
      }),
    'Check profile ownership',
  );

  if (!existingProfileResult.success) {
    throw existingProfileResult.error!;
  }

  if (!existingProfileResult.data) {
    throw AppError.notFound('Profile not found');
  }

  validateResourceAccess(existingProfileResult.data.uid, user);

  // Also unpublish all services associated with this profile
  const result = await executeQuery(
    () =>
      prisma.$transaction([
        prisma.profile.update({
          where: { id },
          data: { published: false },
        }),
        prisma.service.updateMany({
          where: { pid: id },
          data: { published: false },
        }),
      ]),
    'Delete profile and services',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    { id, published: false },
    'Profile deleted successfully',
  );
}, 'Delete profile');

export const deleteProfile = [
  zValidator('param', idParamSchema),
  deleteProfileHandler,
];

/**
 * GET /profiles/user/:userId
 * Get profile by user ID
 */
const getProfileByUserIdHandler = withErrorHandling(async (c: any) => {
  const { userId } = c.req.valid('param');

  const result = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: userId },
        select: {
          id: true,
          uid: true,
          type: true,
          tagline: true,
          description: true,
          skills: true,
          experience: true,
          rate: true,
          website: true,
          verified: true,
          featured: true,
          published: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
              type: true,
              confirmed: true,
            },
          },
          image: {
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
        },
      }),
    'Get profile by user ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Profile not found');
  }

  return successResponse(result.data, 'Profile retrieved successfully');
}, 'Get profile by user ID');

export const getProfileByUserId = [
  zValidator('param', z.object({ userId: idParamSchema.shape.id })),
  getProfileByUserIdHandler,
];

/**
 * GET /profiles/me
 * Get current user's profile
 */
const getCurrentUserProfileHandler = withErrorHandling(async (c: any) => {
  const user = c.get('user');

  const result = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: {
          id: true,
          uid: true,
          type: true,
          tagline: true,
          description: true,
          skills: true,
          experience: true,
          rate: true,
          website: true,
          verified: true,
          featured: true,
          published: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
              type: true,
              confirmed: true,
            },
          },
          image: {
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
          services: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              category: true,
              published: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    'Get current user profile',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Profile not found');
  }

  return successResponse(result.data, 'Profile retrieved successfully');
}, 'Get current user profile');

export const getCurrentUserProfile = getCurrentUserProfileHandler;

/**
 * PATCH /profiles/:id/publish
 * Publish/unpublish profile (admin or owner only)
 */
const toggleProfilePublishHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const { published } = c.req.valid('json');
  const user = c.get('user');

  // Check if profile exists and user owns it
  const existingProfileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { id },
        select: {
          uid: true,
        },
      }),
    'Check profile ownership',
  );

  if (!existingProfileResult.success) {
    throw existingProfileResult.error!;
  }

  if (!existingProfileResult.data) {
    throw AppError.notFound('Profile not found');
  }

  validateResourceAccess(existingProfileResult.data.uid, user);

  const result = await executeQuery(
    () =>
      prisma.profile.update({
        where: { id },
        data: { published },
        select: {
          id: true,
          published: true,
          updatedAt: true,
        },
      }),
    'Toggle profile publish status',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    result.data,
    `Profile ${published ? 'published' : 'unpublished'} successfully`,
  );
}, 'Toggle profile publish');

export const toggleProfilePublish = [
  zValidator('param', idParamSchema),
  zValidator('json', z.object({ published: z.boolean() })),
  toggleProfilePublishHandler,
];
