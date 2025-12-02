'use server';

import { prisma } from '@/lib/prisma/client';
import { transformChatForList } from '@/lib/utils/messages';
import type { ChatListItem, ChatWithRelations } from '@/lib/types/messages';
import { customAlphabet } from 'nanoid';
import { getUnreadCount } from './messages';

// URL-safe alphabet without lookalike characters (no i, l, 1, o, 0)
const nanoid = customAlphabet('23456789abcdefghjkmnpqrstvwxyz', 10);

/**
 * Get all chats for a user with unread counts
 */
export async function getChats(userId: string): Promise<ChatListItem[]> {
  try {
    // Fetch all chats where user is a member
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            uid: userId,
          },
        },
      },
      select: {
        id: true,
        cid: true,
        name: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        creatorUid: true,
        lastMessageId: true,
        lastActivity: true,
        lastMessage: {
          where: {
            deleted: false,
          },
        },
        members: {
          include: {
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
        messages: {
          where: {
            deleted: false,
          },
          select: {
            id: true,
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                deleted: false,
              },
            },
          },
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    // Filter out chats with no non-deleted messages
    const activeChats = chats.filter((chat) => chat.messages.length > 0 || chat._count.messages > 0);

    // Transform chats for UI display
    const chatListItems = activeChats.map((chat) =>
      transformChatForList(chat as ChatWithRelations, userId),
    );

    // Add unread counts to each chat
    const chatListItemsWithUnread = await Promise.all(
      chatListItems.map(async (chat) => ({
        ...chat,
        unread: await getUnreadCount(chat.id, userId),
      }))
    );

    return chatListItemsWithUnread;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw new Error('Failed to fetch chats');
  }
}

/**
 * Get a single chat by ID with validation
 */
export async function getChatById(
  chatId: string,
  userId: string,
): Promise<ChatWithRelations | null> {
  try {
    // Fetch chat with validation that user is a member
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            uid: userId,
          },
        },
      },
      include: {
        lastMessage: true,
        members: {
          include: {
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
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return chat as ChatWithRelations | null;
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw new Error('Failed to fetch chat');
  }
}

/**
 * Get or create a chat between two users
 */
export async function getOrCreateChat(
  userId: string,
  otherUserId: string,
): Promise<{ chatId: string; isNew: boolean }> {
  try {
    // Check if either user has blocked the other
    const blocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherUserId },
          { blockerId: otherUserId, blockedId: userId },
        ],
      },
    });

    if (blocked) {
      throw new Error('Cannot create chat with blocked user');
    }

    // Check if chat already exists between these two users
    const existingChat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            members: {
              some: {
                uid: userId,
              },
            },
          },
          {
            members: {
              some: {
                uid: otherUserId,
              },
            },
          },
        ],
        // Only find 1-on-1 chats (exactly 2 members)
        members: {
          none: {
            NOT: {
              uid: {
                in: [userId, otherUserId],
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      return { chatId: existingChat.id, isNew: false };
    }

    // Generate unique cid
    let cid = nanoid();
    let attempts = 0;

    // Handle collision (very unlikely)
    while (attempts < 10) {
      const exists = await prisma.chat.findUnique({
        where: { cid },
      });

      if (!exists) break;

      cid = nanoid();
      attempts++;
    }

    if (attempts >= 10) {
      throw new Error('Failed to generate unique cid after 10 attempts');
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        cid,
        creatorUid: userId,
        members: {
          create: [
            {
              uid: userId,
            },
            {
              uid: otherUserId,
            },
          ],
        },
      },
    });

    return { chatId: newChat.id, isNew: true };
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    throw error;
  }
}

/**
 * Delete a chat (soft delete all messages and optionally remove chat)
 */
export async function deleteChat(
  chatId: string,
  userId: string,
): Promise<void> {
  try {
    // Verify user is a member of the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            uid: userId,
          },
        },
      },
    });

    if (!chat) {
      throw new Error('Chat not found or user is not a member');
    }

    // Use transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // Soft delete all messages in the chat
      await tx.message.updateMany({
        where: {
          chatId: chatId,
        },
        data: {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Check if there are only 2 members (1-on-1 chat)
      const memberCount = await tx.chatMember.count({
        where: { chatId: chatId },
      });

      // For 1-on-1 chats, remove the current user's membership
      // This effectively hides the chat for them
      if (memberCount <= 2) {
        await tx.chatMember.delete({
          where: {
            chatId_uid: {
              chatId: chatId,
              uid: userId,
            },
          },
        });

        // Check remaining members after deletion
        const remainingMembers = await tx.chatMember.count({
          where: { chatId: chatId },
        });

        // If only one or no members left, delete the chat entirely
        if (remainingMembers <= 1) {
          // Delete remaining memberships first
          await tx.chatMember.deleteMany({
            where: { chatId: chatId },
          });

          // Then delete the chat
          await tx.chat.delete({
            where: { id: chatId },
          });
        }
      }
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw new Error('Failed to delete chat');
  }
}
