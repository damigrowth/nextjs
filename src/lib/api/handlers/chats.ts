/**
 * Chat Route Handlers - CORRECTED FOR ACTUAL PRISMA SCHEMA
 * Following Hono docs with proper zValidator usage and AppError handling
 * Note: Your chat system uses Profile relations, not User
 */

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  createChatSchema,
  chatQuerySchema,
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
 * GET /chat
 * Get all chats for current user (via their profile)
 */
const getChatsHandler = withErrorHandling(async (c: any) => {
  const { page, limit, search, published, sort, order } =
    c.req.valid('query');
  const user = c.get('user');
  const offset = (page - 1) * limit;

  // First get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required for chat functionality');
  }

  const where = {
    members: {
      some: {
        profileId: profileResult.data.id,
      },
    },
    published: published !== undefined ? published : true,
    ...(search && {
      name: { contains: search, mode: Prisma.QueryMode.insensitive },
    }),
  };

  const [chatsResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.chat.findMany({
          where,
          select: {
            id: true,
            name: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            creatorId: true,
            creator: {
              select: {
                id: true,
                uid: true,
                tagline: true,
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
            },
            members: {
              select: {
                profileId: true,
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
                        image: true,
                      },
                    },
                  },
                },
              },
              take: 5,
            },
            _count: {
              select: {
                messages: true,
                members: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { updatedAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get chats',
    ),
    executeQuery(() => prisma.chat.count({ where }), 'Count chats'),
  ]);

  if (!chatsResult.success) {
    throw chatsResult.error!;
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
    chatsResult.data!,
    pagination,
    'Chats retrieved successfully',
  );
}, 'Get chats');

export const getChats = [
  zValidator('query', chatQuerySchema),
  getChatsHandler,
];

/**
 * GET /chat/:id
 * Get chat by ID
 */
const getChatByIdHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // First get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required for chat functionality');
  }

  const result = await executeQuery(
    () =>
      prisma.chat.findFirst({
        where: {
          id,
          members: {
            some: {
              profileId: profileResult.data.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          creator: {
            select: {
              id: true,
              uid: true,
              tagline: true,
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
          },
          members: {
            select: {
              profileId: true,
              profile: {
                select: {
                  id: true,
                  uid: true,
                  tagline: true,
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
                },
              },
            },
          },
          _count: {
            select: {
              messages: true,
              members: true,
            },
          },
        },
      }),
    'Get chat by ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Chat not found');
  }

  return successResponse(result.data, 'Chat retrieved successfully');
}, 'Get chat by ID');

export const getChatById = [
  zValidator('param', idParamSchema),
  getChatByIdHandler,
];

/**
 * POST /chat
 * Create new chat
 */const createChatHandler = withErrorHandling(async (c: any) => {
  const chatData = c.req.valid('json');
  const user = c.get('user');

  // Get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required to create chats');
  }

  // Check if participant profile exists
  const participantProfileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { id: chatData.participantProfileId },
        select: { id: true, uid: true },
      }),
    'Check participant profile',
  );

  if (!participantProfileResult.success) {
    throw participantProfileResult.error!;
  }

  if (!participantProfileResult.data) {
    throw AppError.notFound('Participant profile not found');
  }

  // Check if chat already exists between these profiles
  const existingChatResult = await executeQuery(
    () =>
      prisma.chat.findFirst({
        where: {
          AND: [
            {
              members: {
                some: {
                  profileId: profileResult.data.id,
                },
              },
            },
            {
              members: {
                some: {
                  profileId: chatData.participantProfileId,
                },
              },
            },
            {
              members: {
                every: {
                  profileId: {
                    in: [
                      profileResult.data.id,
                      chatData.participantProfileId,
                    ],
                  },
                },
              },
            },
          ],
        },
        select: { id: true },
      }),
    'Check existing chat',
  );

  if (!existingChatResult.success) {
    throw existingChatResult.error!;
  }

  if (existingChatResult.data) {
    throw AppError.conflict('Chat already exists between these profiles');
  }

  // Create chat with members
  const result = await executeQuery(
    () =>
      prisma.chat.create({
        data: {
          name: chatData.name,
          creatorId: profileResult.data.id,
          members: {
            create: [
              {
                profileId: profileResult.data.id,
              },
              {
                profileId: chatData.participantProfileId,
              },
            ],
          },
        },
        select: {
          id: true,
          name: true,
          published: true,
          createdAt: true,
          creator: {
            select: {
              id: true,
              uid: true,
              user: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          members: {
            select: {
              profileId: true,
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
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    'Create chat',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Chat created successfully', 201);
}, 'Create chat');

export const createChat = [
  zValidator('json', createChatSchema),
  createChatHandler,
];

/**
 * PUT /chat/:id
 * Update chat (name, etc.)
 */
const updateChatHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const chatData = c.req.valid('json');
  const user = c.get('user');

  // Get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required');
  }

  // Check if user is creator of the chat
  const chatInfoResult = await executeQuery(
    () =>
      prisma.chat.findUnique({
        where: { id },
        select: { creatorId: true },
      }),
    'Check chat creator',
  );

  if (!chatInfoResult.success) {
    throw chatInfoResult.error!;
  }

  if (!chatInfoResult.data) {
    throw AppError.notFound('Chat not found');
  }

  if (chatInfoResult.data.creatorId !== profileResult.data.id) {
    throw AppError.forbidden('Only chat creator can update the chat');
  }

  const result = await executeQuery(
    () =>
      prisma.chat.update({
        where: { id },
        data: chatData,
        select: {
          id: true,
          name: true,
          published: true,
          updatedAt: true,
        },
      }),
    'Update chat',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Chat updated successfully');
}, 'Update chat');

export const updateChat = [
  zValidator('param', idParamSchema),
  zValidator(
    'json',
    createChatSchema.partial().omit({ participantProfileId: true }),
  ),
  updateChatHandler,
];

/**
 * DELETE /chat/:id
 * Delete chat (soft delete)
 */
const deleteChatHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // Get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required');
  }

  // Check if user is creator of the chat
  const chatInfoResult = await executeQuery(
    () =>
      prisma.chat.findUnique({
        where: { id },
        select: { creatorId: true },
      }),
    'Check chat creator',
  );

  if (!chatInfoResult.success) {
    throw chatInfoResult.error!;
  }

  if (!chatInfoResult.data) {
    throw AppError.notFound('Chat not found');
  }

  if (chatInfoResult.data.creatorId !== profileResult.data.id) {
    throw AppError.forbidden('Only chat creator can delete the chat');
  }

  const result = await executeQuery(
    () =>
      prisma.chat.update({
        where: { id },
        data: { published: false },
        select: {
          id: true,
          published: true,
          updatedAt: true,
        },
      }),
    'Delete chat',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Chat deleted successfully');
}, 'Delete chat');

export const deleteChat = [
  zValidator('param', idParamSchema),
  deleteChatHandler,
];

/**
 * GET /chat/:id/members
 * Get chat members
 */
const getChatMembersHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // Get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required');
  }

  // Check if user is member of the chat
  const memberCheckResult = await executeQuery(
    () =>
      prisma.chatMember.findUnique({
        where: {
          chatId_profileId: {
            chatId: id,
            profileId: profileResult.data.id,
          },
        },
      }),
    'Check chat membership',
  );

  if (!memberCheckResult.success) {
    throw memberCheckResult.error!;
  }

  if (!memberCheckResult.data) {
    throw AppError.forbidden('Access denied');
  }

  const result = await executeQuery(
    () =>
      prisma.chatMember.findMany({
        where: {
          chatId: id,
        },
        select: {
          profileId: true,
          profile: {
            select: {
              id: true,
              uid: true,
              tagline: true,
              verified: true,
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
            },
          },
        },
      }),
    'Get chat members',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    result.data,
    'Chat members retrieved successfully',
  );
}, 'Get chat members');

export const getChatMembers = [
  zValidator('param', idParamSchema),
  getChatMembersHandler,
];

/**
 * POST /chat/:id/members
 * Add member to chat
 */
const addMemberHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const { profileId } = c.req.valid('json');
  const user = c.get('user');

  // Get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required');
  }

  // Check if current user is creator of the chat
  const chatInfoResult = await executeQuery(
    () =>
      prisma.chat.findUnique({
        where: { id },
        select: { creatorId: true },
      }),
    'Check chat creator',
  );

  if (!chatInfoResult.success) {
    throw chatInfoResult.error!;
  }

  if (!chatInfoResult.data) {
    throw AppError.notFound('Chat not found');
  }

  if (chatInfoResult.data.creatorId !== profileResult.data.id) {
    throw AppError.forbidden('Only chat creator can add members');
  }

  // Check if profile is already a member
  const existingMemberResult = await executeQuery(
    () =>
      prisma.chatMember.findUnique({
        where: {
          chatId_profileId: {
            chatId: id,
            profileId: profileId,
          },
        },
      }),
    'Check existing membership',
  );

  if (!existingMemberResult.success) {
    throw existingMemberResult.error!;
  }

  if (existingMemberResult.data) {
    throw AppError.conflict('Profile is already a member of this chat');
  }

  const result = await executeQuery(
    () =>
      prisma.chatMember.create({
        data: {
          chatId: id,
          profileId: profileId,
        },
        select: {
          profileId: true,
          profile: {
            select: {
              id: true,
              uid: true,
              tagline: true,
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
          },
        },
      }),
    'Add member',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Member added successfully', 201);
}, 'Add member');

export const addMember = [
  zValidator('param', idParamSchema),
  zValidator(
    'json',
    z.object({
      profileId: idParamSchema.shape.id,
    }),
  ),
  addMemberHandler,
];

/**
 * DELETE /chat/:id/members/:profileId
 * Remove member from chat
 */
const removeMemberHandler = withErrorHandling(async (c: any) => {
  const { id, profileId } = c.req.valid('param');
  const user = c.get('user');

  // Get user's profile
  const profileResult = await executeQuery(
    () =>
      prisma.profile.findUnique({
        where: { uid: user.id },
        select: { id: true },
      }),
    'Get user profile',
  );

  if (!profileResult.success) {
    throw profileResult.error!;
  }

  if (!profileResult.data) {
    throw AppError.badRequest('Profile required');
  }

  // Check if current user is creator or removing themselves
  const chatInfoResult = await executeQuery(
    () =>
      prisma.chat.findUnique({
        where: { id },
        select: { creatorId: true },
      }),
    'Check chat creator',
  );

  if (!chatInfoResult.success) {
    throw chatInfoResult.error!;
  }

  if (!chatInfoResult.data) {
    throw AppError.notFound('Chat not found');
  }

  const isCreator = chatInfoResult.data.creatorId === profileResult.data.id;
  const isRemovingSelf = profileId === profileResult.data.id;

  if (!isCreator && !isRemovingSelf) {
    throw AppError.forbidden('Access denied');
  }

  const result = await executeQuery(
    () =>
      prisma.chatMember.delete({
        where: {
          chatId_profileId: {
            chatId: id,
            profileId: profileId,
          },
        },
        select: {
          profileId: true,
        },
      }),
    'Remove member',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Member removed successfully');
}, 'Remove member');

export const removeMember = [
  zValidator(
    'param',
    idParamSchema.extend({ profileId: idParamSchema.shape.id }),
  ),
  removeMemberHandler,
];
