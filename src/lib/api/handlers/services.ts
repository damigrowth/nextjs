/**
 * Service Route Handlers - CORRECTED FOR ACTUAL PRISMA SCHEMA
 * Following Hono docs with proper zValidator usage
 */

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceQuerySchema,
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
 * GET /services
 * Get all services with pagination and filters
 */
const getServicesHandler = withErrorHandling(async (c: any) => {
  const {
    page,
    limit,
    search,
    category,
    subcategory,
    minPrice,
    maxPrice,
    pricingType,
    location,
    published,
    featured,
    sort,
    order,
  } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    published: published !== undefined ? published : true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        {
          description: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        { tags: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    }),
    ...(category && {
      category: { contains: category, mode: Prisma.QueryMode.insensitive },
    }),
    ...(subcategory && {
      subcategory: {
        contains: subcategory,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(minPrice && { price: { gte: minPrice } }),
    ...(maxPrice && { price: { lte: maxPrice } }),
    ...(pricingType && { pricingType }),
    ...(location && { location }),
    ...(featured !== undefined && { featured }),
  };

  const [servicesResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.service.findMany({
          where,
          select: {
            id: true,
            pid: true,
            title: true,
            description: true,
            price: true,
            category: true,
            subcategory: true,
            tags: true,
            pricingType: true,
            duration: true,
            location: true,
            published: true,
            featured: true,
            rating: true,
            reviewCount: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                id: true,
                uid: true,
                type: true,
                tagline: true,
                verified: true,
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    firstName: true,
                    lastName: true,
                    image: true,
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
            },
            media: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
              take: 1,
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get services',
    ),
    executeQuery(() => prisma.service.count({ where }), 'Count services'),
  ]);

  if (!servicesResult.success) {
    throw servicesResult.error!;
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
    servicesResult.data!,
    pagination,
    'Services retrieved successfully',
  );
}, 'Get services');

export const getServices = [
  zValidator('query', serviceQuerySchema),
  getServicesHandler,
];

/**
 * GET /services/:id
 * Get service by ID
 */
const getServiceByIdHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');

  const result = await executeQuery(
    () =>
      prisma.service.findUnique({
        where: { id },
        select: {
          id: true,
          pid: true,
          title: true,
          description: true,
          price: true,
          category: true,
          subcategory: true,
          tags: true,
          pricingType: true,
          duration: true,
          location: true,
          published: true,
          featured: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              uid: true,
              type: true,
              tagline: true,
              description: true,
              website: true,
              experience: true,
              rate: true,
              verified: true,
              rating: true,
              reviewCount: true,
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
          },
          media: {
            select: {
              id: true,
              url: true,
              alt: true,
              caption: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              published: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      }),
    'Get service by ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Service not found');
  }

  return successResponse(result.data, 'Service retrieved successfully');
}, 'Get service by ID');

export const getServiceById = [
  zValidator('param', idParamSchema),
  getServiceByIdHandler,
];

/**
 * POST /services
 * Create new service (requires profile)
 */
const createServiceHandler = withErrorHandling(async (c: any) => {
  const serviceData = c.req.valid('json');
  const user = c.get('user');

  // Check if user can create services (freelancers and companies)
  validateUserType([2, 3], user.type); // 2 = freelancer, 3 = company

  // Get user's profile (required for services)
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true, published: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest(
      'You must create a profile before creating services',
    );
  }

  if (!profileResult.data.published) {
    throw AppError.badRequest(
      'Your profile must be published to create services',
    );
  }

  const result = await executeQuery(
    () =>
      prisma.service.create({
        data: {
          ...serviceData,
          pid: profileResult.data!.id, // Use profile ID, not user ID
        },
        select: {
          id: true,
          pid: true,
          title: true,
          description: true,
          price: true,
          category: true,
          subcategory: true,
          tags: true,
          pricingType: true,
          duration: true,
          location: true,
          published: true,
          createdAt: true,
          profile: {
            select: {
              id: true,
              uid: true,
              user: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    'Create service',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Service created successfully', 201);
}, 'Create service');

export const createService = [
  zValidator('json', createServiceSchema),
  createServiceHandler,
];

/**
 * PUT /services/:id
 * Update service
 */
const updateServiceHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const serviceData = c.req.valid('json');
  const user = c.get('user');

  // Check if service exists and user owns it
  const existingService = await executeQuery(
    () =>
      prisma.service.findUnique({
        where: { id },
        select: {
          pid: true,
          profile: {
            select: {
              uid: true,
            },
          },
        },
      }),
    'Check service ownership',
  );

  if (!existingService.success) {
    throw existingService.error!;
  }

  if (!existingService.data) {
    throw AppError.notFound('Service not found');
  }

  validateResourceAccess(existingService.data.profile.uid, user);

  const result = await executeQuery(
    () =>
      prisma.service.update({
        where: { id },
        data: serviceData,
        select: {
          id: true,
          pid: true,
          title: true,
          description: true,
          price: true,
          category: true,
          subcategory: true,
          tags: true,
          pricingType: true,
          duration: true,
          location: true,
          published: true,
          featured: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              uid: true,
              user: {
                select: {
                  id: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
    'Update service',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Service updated successfully');
}, 'Update service');

export const updateService = [
  zValidator('param', idParamSchema),
  zValidator('json', updateServiceSchema),
  updateServiceHandler,
];

/**
 * DELETE /services/:id
 * Delete service (soft delete by unpublishing)
 */
const deleteServiceHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // Check if service exists and user owns it
  const existingService = await executeQuery(
    () =>
      prisma.service.findUnique({
        where: { id },
        select: {
          pid: true,
          profile: {
            select: {
              uid: true,
            },
          },
        },
      }),
    'Check service ownership',
  );

  if (!existingService.success) {
    throw existingService.error!;
  }

  if (!existingService.data) {
    throw AppError.notFound('Service not found');
  }

  validateResourceAccess(existingService.data.profile.uid, user);

  const result = await executeQuery(
    () =>
      prisma.service.update({
        where: { id },
        data: { published: false },
        select: {
          id: true,
          published: true,
          updatedAt: true,
        },
      }),
    'Delete service',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Service deleted successfully');
}, 'Delete service');

export const deleteService = [
  zValidator('param', idParamSchema),
  deleteServiceHandler,
];

/**
 * GET /services/profile/:profileId
 * Get services by profile ID
 */
const getServicesByProfileIdHandler = withErrorHandling(async (c: any) => {
  const { profileId } = c.req.valid('param');
  const { page, limit, published, sort, order } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    pid: profileId,
    ...(published !== undefined && { published }),
  };

  const [servicesResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.service.findMany({
          where,
          select: {
            id: true,
            pid: true,
            title: true,
            description: true,
            price: true,
            category: true,
            subcategory: true,
            pricingType: true,
            duration: true,
            published: true,
            featured: true,
            rating: true,
            reviewCount: true,
            createdAt: true,
            updatedAt: true,
            media: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
              take: 1,
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get services by profile ID',
    ),
    executeQuery(
      () => prisma.service.count({ where }),
      'Count services by profile ID',
    ),
  ]);

  if (!servicesResult.success) {
    throw servicesResult.error!;
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
    servicesResult.data!,
    pagination,
    'Services retrieved successfully',
  );
}, 'Get services by profile ID');

export const getServicesByProfileId = [
  zValidator('param', z.object({ profileId: idParamSchema.shape.id })),
  zValidator('query', serviceQuerySchema),
  getServicesByProfileIdHandler,
];

/**
 * GET /services/user/:userId
 * Get services by user ID (via their profile)
 */
const getServicesByUserIdHandler = withErrorHandling(async (c: any) => {
  const { userId } = c.req.valid('param');
  const { page, limit, published, sort, order } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    profile: {
      uid: userId,
    },
    ...(published !== undefined && { published }),
  };

  const [servicesResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.service.findMany({
          where,
          select: {
            id: true,
            pid: true,
            title: true,
            description: true,
            price: true,
            category: true,
            subcategory: true,
            pricingType: true,
            duration: true,
            published: true,
            featured: true,
            rating: true,
            reviewCount: true,
            createdAt: true,
            updatedAt: true,
            media: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
              take: 1,
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get services by user ID',
    ),
    executeQuery(
      () => prisma.service.count({ where }),
      'Count services by user ID',
    ),
  ]);

  if (!servicesResult.success) {
    throw servicesResult.error!;
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
    servicesResult.data!,
    pagination,
    'Services retrieved successfully',
  );
}, 'Get services by user ID');

export const getServicesByUserId = [
  zValidator('param', z.object({ userId: idParamSchema.shape.id })),
  zValidator('query', serviceQuerySchema),
  getServicesByUserIdHandler,
];
