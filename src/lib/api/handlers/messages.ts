/**
 * Message Route Handlers - CORRECTED FOR ACTUAL PRISMA SCHEMA
 * Following Hono docs with proper zValidator usage and AppError handling
 * Note: Your message system uses Profile relations and 'uid' for MessageRead
 */

import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  sendMessageSchema,
  messageQuerySchema,
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
 * GET /messages
 * Get messages for current user across all chats
 */
const getMessagesHandler = withErrorHandling(async (c: any) => {
  const {
    page,
    limit,
    chatId,
    authorId,
    read,
    published,
    search,
    sort,
    order,
  } = c.req.valid('query');
  const user = c.get('user');
  const offset = (page - 1) * limit;

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
    throw AppError.badRequest('Profile required for messaging');
  }

  const where = {
    chat: {
      members: {
        some: {
          profileId: profileResult.data.id,
        },
      },
    },
    published: published !== undefined ? published : true,
    ...(chatId && { chatId }),
    ...(authorId && { authorId }),
    ...(search && {
      content: { contains: search, mode: Prisma.QueryMode.insensitive },
    }),
  };

  const [messagesResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.message.findMany({
          where,
          select: {
            id: true,
            content: true,
            read: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            authorId: true,
            chatId: true,
            author: {
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
            chat: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get messages',
    ),
    executeQuery(() => prisma.message.count({ where }), 'Count messages'),
  ]);

  if (!messagesResult.success) {
    throw messagesResult.error!;
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
    messagesResult.data!,
    pagination,
    'Messages retrieved successfully',
  );
}, 'Get messages');

export const getMessages = [
  zValidator('query', messageQuerySchema),
  getMessagesHandler,
];

/**
 * GET /messages/:id
 * Get message by ID
 */
const getMessageByIdHandler = withErrorHandling(async (c: any) => {
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

  const result = await executeQuery(
    () =>
      prisma.message.findFirst({
        where: {
          id,
          chat: {
            members: {
              some: {
                profileId: profileResult.data.id,
              },
            },
          },
        },
        select: {
          id: true,
          content: true,
          read: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          authorId: true,
          chatId: true,
          author: {
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
                },
              },
            },
          },
          chat: {
            select: {
              id: true,
              name: true,
            },
          },
          readBy: {
            select: {
              uid: true,
              readAt: true,
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
    'Get message by ID',
  );

  if (!result.success) {
    throw result.error!;
  }

  if (!result.data) {
    throw AppError.notFound('Message not found');
  }

  return successResponse(result.data, 'Message retrieved successfully');
}, 'Get message by ID');

export const getMessageById = [
  zValidator('param', idParamSchema),
  getMessageByIdHandler,
];

/**
 * POST /chat/:chatId/messages
 * Send message in chat
 */
const sendMessageHandler = withErrorHandling(async (c: any) => {
  const { chatId } = c.req.valid('param');
  const messageData = c.req.valid('json');
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
    throw AppError.badRequest('Profile required to send messages');
  }

  // Check if user is member of the chat
  const memberCheckResult = await executeQuery(
    () =>
      prisma.chatMember.findUnique({
        where: {
          chatId_profileId: {
            chatId: chatId,
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
      prisma.message.create({
        data: {
          content: messageData.content,
          chatId: chatId,
          authorId: profileResult.data.id,
        },
        select: {
          id: true,
          content: true,
          read: true,
          published: true,
          createdAt: true,
          authorId: true,
          chatId: true,
          author: {
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
      }),
    'Send message',
  );

  if (!result.success) {
    throw result.error!;
  }

  // Update chat's last activity and lastMessageId
  await executeQuery(
    () =>
      prisma.chat.update({
        where: { id: chatId },
        data: {
          updatedAt: new Date(),
          lastMessageId: result.data!.id,
        },
      }),
    'Update chat activity',
  );

  return successResponse(result.data, 'Message sent successfully', 201);
}, 'Send message');

export const sendMessage = [
  zValidator('param', idParamSchema.extend({ chatId: idParamSchema.shape.id })),
  zValidator('json', sendMessageSchema),
  sendMessageHandler,
];

/**
 * PUT /messages/:id
 * Update message (edit content)
 */
const updateMessageHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const { content } = c.req.valid('json');
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

  // Check if message exists and user owns it
  const existingMessageResult = await executeQuery(
    () =>
      prisma.message.findUnique({
        where: { id },
        select: { authorId: true, createdAt: true },
      }),
    'Check message ownership',
  );

  if (!existingMessageResult.success) {
    throw existingMessageResult.error!;
  }

  if (!existingMessageResult.data) {
    throw AppError.notFound('Message not found');
  }

  if (existingMessageResult.data.authorId !== profileResult.data.id) {
    throw AppError.forbidden('Access denied');
  }

  // Check if message is too old to edit (e.g., 24 hours)
  const hoursSinceCreated =
    (new Date().getTime() -
      new Date(existingMessageResult.data.createdAt).getTime()) /
    (1000 * 60 * 60);
  if (hoursSinceCreated > 24) {
    throw AppError.forbidden('Message is too old to edit');
  }

  const result = await executeQuery(
    () =>
      prisma.message.update({
        where: { id },
        data: {
          content,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          content: true,
          read: true,
          published: true,
          updatedAt: true,
          author: {
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
        },
      }),
    'Update message',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Message updated successfully');
}, 'Update message');

export const updateMessage = [
  zValidator('param', idParamSchema),
  zValidator(
    'json',
    z.object({
      content: z.string().min(1, 'Message content is required').max(1000),
    }),
  ),
  updateMessageHandler,
];

/**
 * DELETE /messages/:id
 * Delete message
 */
const deleteMessageHandler = withErrorHandling(async (c: any) => {
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

  // Check if message exists and get chat info
  const messageInfoResult = await executeQuery(
    () =>
      prisma.message.findUnique({
        where: { id },
        select: {
          authorId: true,
          chatId: true,
          chat: {
            select: {
              creatorId: true,
            },
          },
        },
      }),
    'Check message and permissions',
  );

  if (!messageInfoResult.success) {
    throw messageInfoResult.error!;
  }

  if (!messageInfoResult.data) {
    throw AppError.notFound('Message not found');
  }

  const isAuthor = messageInfoResult.data.authorId === profileResult.data.id;
  const isChatCreator =
    messageInfoResult.data.chat.creatorId === profileResult.data.id;

  if (!isAuthor && !isChatCreator) {
    throw AppError.forbidden('Access denied');
  }

  const result = await executeQuery(
    () =>
      prisma.message.delete({
        where: { id },
        select: {
          id: true,
        },
      }),
    'Delete message',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Message deleted successfully');
}, 'Delete message');

export const deleteMessage = [
  zValidator('param', idParamSchema),
  deleteMessageHandler,
];

/**
 * GET /chat/:chatId/messages
 * Get messages for a specific chat
 */
const getChatMessagesHandler = withErrorHandling(async (c: any) => {
  const { chatId } = c.req.valid('param');
  const { page, limit, authorId, read, published, search, sort, order } =
    c.req.valid('query');
  const user = c.get('user');
  const offset = (page - 1) * limit;

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
            chatId: chatId,
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

  const where = {
    chatId,
    published: published !== undefined ? published : true,
    ...(authorId && { authorId }),
    ...(search && {
      content: { contains: search, mode: Prisma.QueryMode.insensitive },
    }),
  };

  const [messagesResult, countResult] = await Promise.all([
    executeQuery(
      () =>
        prisma.message.findMany({
          where,
          select: {
            id: true,
            content: true,
            read: true,
            published: true,
            createdAt: true,
            updatedAt: true,
            authorId: true,
            author: {
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
          orderBy: sort ? { [sort]: order } : { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
      'Get chat messages',
    ),
    executeQuery(
      () => prisma.message.count({ where }),
      'Count chat messages',
    ),
  ]);

  if (!messagesResult.success) {
    throw messagesResult.error!;
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
    messagesResult.data!,
    pagination,
    'Messages retrieved successfully',
  );
}, 'Get chat messages');

export const getChatMessages = [
  zValidator('param', idParamSchema.extend({ chatId: idParamSchema.shape.id })),
  zValidator('query', messageQuerySchema.omit({ chatId: true })),
  getChatMessagesHandler,
];

/**
 * POST /messages/:id/read
 * Mark message as read
 */
const markAsReadHandler = withErrorHandling(async (c: any) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');

  // Check if user is member of the chat and message exists
  const messageInfoResult = await executeQuery(
    () =>
      prisma.message.findFirst({
        where: {
          id,
          chat: {
            members: {
              some: {
                profile: {
                  uid: user.id,
                },
              },
            },
          },
        },
        select: { chatId: true, authorId: true },
      }),
    'Check message access',
  );

  if (!messageInfoResult.success) {
    throw messageInfoResult.error!;
  }

  if (!messageInfoResult.data) {
    throw AppError.notFound('Message not found');
  }

  // Check if already marked as read
  const existingReadResult = await executeQuery(
    () =>
      prisma.messageRead.findUnique({
        where: {
          messageId_uid: {
            messageId: id,
            uid: user.id,
          },
        },
      }),
    'Check existing read status',
  );

  if (!existingReadResult.success) {
    throw existingReadResult.error!;
  }

  if (existingReadResult.data) {
    return successResponse({ message: 'Message already marked as read' });
  }

  const result = await executeQuery(
    () =>
      prisma.messageRead.create({
        data: {
          messageId: id,
          uid: user.id,
          readAt: new Date(),
        },
        select: {
          messageId: true,
          uid: true,
          readAt: true,
        },
      }),
    'Mark message as read',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(result.data, 'Message marked as read');
}, 'Mark message as read');

export const markAsRead = [
  zValidator('param', idParamSchema),
  markAsReadHandler,
];

/**
 * POST /chat/:chatId/messages/mark-all-read
 * Mark all messages in chat as read
 */
const markAllChatMessagesAsReadHandler = withErrorHandling(async (c: any) => {
  const { chatId } = c.req.valid('param');
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
            chatId: chatId,
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

  // Get all unread messages in the chat (not sent by current user's profile)
  const unreadMessagesResult = await executeQuery(
    () =>
      prisma.message.findMany({
        where: {
          chatId,
          authorId: { not: profileResult.data.id },
          NOT: {
            readBy: {
              some: {
                uid: user.id,
              },
            },
          },
        },
        select: { id: true },
      }),
    'Get unread messages',
  );

  if (!unreadMessagesResult.success) {
    throw unreadMessagesResult.error!;
  }

  if (unreadMessagesResult.data!.length === 0) {
    return successResponse({ message: 'No unread messages found' });
  }

  // Mark all as read
  const result = await executeQuery(
    () =>
      prisma.messageRead.createMany({
        data: unreadMessagesResult.data!.map((message) => ({
          messageId: message.id,
          uid: user.id,
          readAt: new Date(),
        })),
        skipDuplicates: true,
      }),
    'Mark all messages as read',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    {
      markedAsRead: result.data!.count,
    },
    `Marked ${result.data!.count} messages as read`,
  );
}, 'Mark all messages as read');

export const markAllChatMessagesAsRead = [
  zValidator('param', idParamSchema.extend({ chatId: idParamSchema.shape.id })),
  markAllChatMessagesAsReadHandler,
];

/**
 * GET /messages/unread-count
 * Get unread message count for current user
 */
const getUnreadCountHandler = withErrorHandling(async (c: any) => {
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

  const result = await executeQuery(
    () =>
      prisma.message.count({
        where: {
          authorId: { not: profileResult.data.id }, // Not sent by current user's profile
          chat: {
            members: {
              some: {
                profileId: profileResult.data.id,
              },
            },
          },
          NOT: {
            readBy: {
              some: {
                uid: user.id,
              },
            },
          },
        },
      }),
    'Get unread message count',
  );

  if (!result.success) {
    throw result.error!;
  }

  return successResponse(
    {
      unreadCount: result.data!,
    },
    'Unread count retrieved successfully',
  );
}, 'Get unread count');

export const getUnreadCount = getUnreadCountHandler;
