'use server';

import { prisma } from '@/lib/prisma/client';
import { transformChatForList } from '@/lib/utils/messages';
import type { ChatListItem, ChatWithRelations } from '@/lib/types/messages';

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
      orderBy: {
        lastActivity: 'desc',
      },
    });

    // Transform chats for UI display
    const chatListItems = chats.map((chat) =>
      transformChatForList(chat as ChatWithRelations, userId)
    );

    return chatListItems;
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
  userId: string
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
  otherUserId: string
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

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
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
 * Delete a chat (soft delete all messages)
 */
export async function deleteChat(
  chatId: string,
  userId: string
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

    // Soft delete all messages in the chat
    await prisma.message.updateMany({
      where: {
        chatId: chatId,
      },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // Optionally delete the chat itself
    // await prisma.chat.delete({ where: { id: chatId } });
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw new Error('Failed to delete chat');
  }
}
