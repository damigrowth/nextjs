/**
 * Media Route Handlers
 * Following Hono docs with proper zValidator usage and AppError handling
 */

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  uploadMediaSchema,
  mediaQuerySchema,
  idParamSchema,
} from '@/lib/api/validations.ts';
import { executeQuery } from '@/lib/api/database.ts';
import { prisma } from '../../../../prisma/client.ts';
import {
  successResponse,
  paginatedResponse,
  withErrorHandling,
  validateResourceAccess,
} from '@/lib/api/error-handler.ts';
import { AppError } from '@/lib/errors';

/**
 * GET /media
 * Get all media with pagination and filters
 */
const getMediaHandler = withErrorHandling(async (c: any) => {
  const { page, limit, type, userId, sort, order } =
    c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    ...(type && { type }),
    ...(userId && { userId }),
  };

  const [mediaResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.media.findMany({
          where,
          select: {
            id: true,
            url: true,
            alt: true,
            caption: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get media',
    ),
    executeQuery(() => prisma.media.count({ where }), 'Count media'),
  ]);

  if (!mediaResult.success) {
    throw mediaResult.error!;
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
    mediaResult.data!,
    pagination,
    'Media retrieved successfully',
  );
}, 'Get media');

export const getMedia = [
  zValidator('query', mediaQuerySchema),
  getMediaHandler,
];

/**
 * GET /media/:id
 * Get media by ID
 */
const getMediaByIdHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');

  const result = await executeQuery(
    () =>
      prisma.media.findUnique({
        where: { id },
        select: {
          id: true,
          url: true,
          alt: true,
          caption: true,
          type: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      }),
    'Get media by ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Media not found');
  }

  return successResponse(result.data, 'Media retrieved successfully');
}, 'Get media by ID');

export const getMediaById = [
  zValidator('param', idParamSchema),
  getMediaByIdHandler,
];

/**
 * POST /media/upload
 * Upload media file
 */
const uploadMediaHandler = withErrorHandling(async (c: any) => {
  const mediaData = c.req.valid('json');
  const user = c.get('user');

  // For now, this is a placeholder that expects the file URL to be provided
  // In a real implementation, you would handle file upload to cloud storage
  const result = await executeQuery(
    () =>
      prisma.media.create({
        data: {
          ...mediaData,
          userId: user.id,
          url: mediaData.url || '', // This would be set after actual file upload
          bytes: mediaData.bytes || 0,
          format: mediaData.format || 'unknown',
        },
        select: {
          id: true,
          url: true,
          alt: true,
          caption: true,
          type: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    'Upload media',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Media uploaded successfully', 201);
}, 'Upload media');

export const uploadMedia = [
  zValidator('json', uploadMediaSchema),
  uploadMediaHandler,
];

/**
 * PUT /media/:id
 * Update media metadata
 */
const updateMediaHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const mediaData = c.req.valid('json');
  const user = c.get('user');

  // Check if media exists and user owns it
  const existingMediaResult = await executeQuery(
    () =>
      prisma.media.findUnique({
        where: { id },
        select: { userId: true },
      }),
    'Check media ownership',
  );

  if (!existingMediaResult.success) {
    throw existingMediaResult.error!;
  }

  if (!existingMediaResult.data) {
    throw AppError.notFound('Media not found');
  }

  validateResourceAccess(existingMediaResult.data.userId, user);

  const result = await executeQuery(
    () =>
      prisma.media.update({
        where: { id },
        data: mediaData,
        select: {
          id: true,
          url: true,
          alt: true,
          caption: true,
          type: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    'Update media',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Media updated successfully');
}, 'Update media');

export const updateMedia = [
  zValidator('param', idParamSchema),
  zValidator('json', uploadMediaSchema.partial()),
  updateMediaHandler,
];

/**
 * DELETE /media/:id
 * Delete media
 */
const deleteMediaHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // Check if media exists and user owns it
  const existingMediaResult = await executeQuery(
    () =>
      prisma.media.findUnique({
        where: { id },
        select: { userId: true, url: true },
      }),
    'Check media ownership',
  );

  if (!existingMediaResult.success) {
    throw existingMediaResult.error!;
  }

  if (!existingMediaResult.data) {
    throw AppError.notFound('Media not found');
  }

  validateResourceAccess(existingMediaResult.data.userId, user);

  const result = await executeQuery(
    () =>
      prisma.media.delete({
        where: { id },
        select: {
          id: true,
          url: true,
        },
      }),
    'Delete media',
  );

  if (!result.success) {
    throw result.error!;
  }

  // TODO: Delete actual file from storage
  // await deleteFileFromStorage(existingMediaResult.data.url);

  return successResponse(result.data, 'Media deleted successfully');
}, 'Delete media');

export const deleteMedia = [
  zValidator('param', idParamSchema),
  deleteMediaHandler,
];

/**
 * GET /media/user/:userId
 * Get media by user ID
 */
const getMediaByUserIdHandler = withErrorHandling(async (c: any) => {
  const { userId } = c.req.valid('param');
  const { page, limit, type, sort, order } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    userId,
    ...(type && { type }),
  };

  const [mediaResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.media.findMany({
          where,
          select: {
            id: true,
            url: true,
            alt: true,
            caption: true,
            type: true,
            createdAt: true,
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get media by user ID',
    ),
    executeQuery(
      () => prisma.media.count({ where }),
      'Count media by user ID',
    ),
  ]);

  if (!mediaResult.success) {
    throw mediaResult.error!;
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
    mediaResult.data!,
    pagination,
    'Media retrieved successfully',
  );
}, 'Get media by user ID');

export const getMediaByUserId = [
  zValidator('param', idParamSchema.extend({ userId: idParamSchema.shape.id })),
  zValidator('query', mediaQuerySchema.omit({ userId: true })),
  getMediaByUserIdHandler,
];

/**
 * GET /media/type/:type
 * Get media by type
 */
const getMediaByTypeHandler = withErrorHandling(async (c: any) => {
  const { type } = c.req.valid('param');
  const { page, limit, userId, sort, order } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const where = {
    type,
    ...(userId && { userId }),
  };

  const [mediaResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.media.findMany({
          where,
          select: {
            id: true,
            url: true,
            alt: true,
            caption: true,
            type: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                displayName: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get media by type',
    ),
    executeQuery(
      () => prisma.media.count({ where }),
      'Count media by type',
    ),
  ]);

  if (!mediaResult.success) {
    throw mediaResult.error!;
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
    mediaResult.data!,
    pagination,
    'Media retrieved successfully',
  );
}, 'Get media by type');

export const getMediaByType = [
  zValidator(
    'param',
    z.object({
      type: z.enum([
        'AVATAR',
        'PORTFOLIO',
        'SERVICE_IMAGE',
        'GENERAL',
      ]),
    }),
  ),
  zValidator('query', mediaQuerySchema.omit({ type: true })),
  getMediaByTypeHandler,
];

/**
 * POST /media/bulk-delete
 * Bulk delete media
 */
const bulkDeleteMediaHandler = withErrorHandling(async (c: any) => {
  const { mediaIds } = c.req.valid('json');
  const user = c.get('user');

  // Check if all media belongs to the user or user is admin
  const mediaOwnershipResult = await executeQuery(
    () =>
      prisma.media.findMany({
        where: {
          id: { in: mediaIds },
        },
        select: {
          id: true,
          userId: true,
          url: true,
        },
      }),
    'Check media ownership for bulk delete',
  );

  if (!mediaOwnershipResult.success) {
    throw mediaOwnershipResult.error!;
  }

  // Verify ownership
  const unauthorizedMedia = mediaOwnershipResult.data!.filter(
    (media) => media.userId !== user.id && user.type !== 0,
  );

  if (unauthorizedMedia.length > 0) {
    throw AppError.forbidden('Access denied to some media files');
  }

  const result = await executeQuery(
    () =>
      prisma.media.deleteMany({
        where: {
          id: { in: mediaIds },
        },
      }),
    'Bulk delete media',
  );

  if (!result.success) {
    throw result.error!;
  }

  // TODO: Delete actual files from storage
  // for (const media of mediaOwnershipResult.data) {
  //   await deleteFileFromStorage(media.url);
  // }

  return successResponse(
    {
      deletedCount: result.data!.count,
      mediaIds,
    },
    `Successfully deleted ${result.data!.count} media files`,
  );
}, 'Bulk delete media');

export const bulkDeleteMedia = [
  zValidator(
    'json',
    z.object({
      mediaIds: z
        .array(idParamSchema.shape.id)
        .min(1, 'At least one media ID is required'),
    }),
  ),
  bulkDeleteMediaHandler,
];

/**
 * GET /media/stats
 * Get media usage statistics for current user
 */
const getMediaStatsHandler = withErrorHandling(async (c: any) => {
  const user = c.get('user');

  const [totalResult, typeStatsResult, sizeResult] =
    await Promise.all([
      executeQuery(
        () =>
          prisma.media.count({
            where: { userId: user.id },
          }),
        'Count total media',
      ),
      executeQuery(
        () =>
          prisma.media.groupBy({
            by: ['type'],
            where: { userId: user.id },
            _count: {
              type: true,
            },
          }),
        'Get media type statistics',
      ),
      executeQuery(
        () =>
          prisma.media.aggregate({
            where: { userId: user.id },
            _sum: {
              bytes: true,
            },
          }),
        'Get total media size',
      ),
    ]);

  if (!totalResult.success) {
    throw totalResult.error!;
  }

  const stats = {
    totalFiles: totalResult.data!,
    totalSize: sizeResult.success ? sizeResult.data!._sum.bytes || 0 : 0,
    byType: typeStatsResult.success
      ? typeStatsResult.data!.reduce((acc: any, item: any) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {})
      : {},
  };

  return successResponse(stats, 'Media statistics retrieved successfully');
}, 'Get media stats');

export const getMediaStats = getMediaStatsHandler;
