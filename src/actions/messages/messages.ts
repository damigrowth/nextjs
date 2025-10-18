'use server';

import { prisma } from '@/lib/prisma/client';
import { transformMessageForChat } from '@/lib/utils/messages';
import type { ChatMessageItem, MessageWithRelations } from '@/lib/types/messages';

/**
 * Get messages for a chat with pagination support
 */
export async function getMessages(
  chatId: string,
  currentUserId: string,
  options?: { limit?: number; before?: string }
): Promise<ChatMessageItem[]> {
  try {
    const limit = options?.limit || 100;

    // Verify user is a member of the chat
    const chatMember = await prisma.chatMember.findUnique({
      where: {
        chatId_uid: {
          chatId: chatId,
          uid: currentUserId,
        },
      },
    });

    if (!chatMember) {
      throw new Error('User is not a member of this chat');
    }

    // Fetch messages with relations
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
        ...(options?.before && {
          createdAt: {
            lt: new Date(options.before),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        readBy: true,
        replyTo: {
          include: {
            author: {
              select: {
                displayName: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    // Transform messages for UI display
    const chatMessages = messages.map((message) =>
      transformMessageForChat(message as MessageWithRelations, currentUserId)
    );

    return chatMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
}

/**
 * Send a new message
 */
export async function sendMessage(
  chatId: string,
  content: string,
  authorUid: string
): Promise<ChatMessageItem> {
  try {
    // Verify user is a member of the chat
    const chatMember = await prisma.chatMember.findUnique({
      where: {
        chatId_uid: {
          chatId: chatId,
          uid: authorUid,
        },
      },
    });

    if (!chatMember) {
      throw new Error('User is not a member of this chat');
    }

    // Create the message and update chat in a transaction
    const message = await prisma.$transaction(async (tx) => {
      // Create message
      const newMessage = await tx.message.create({
        data: {
          content: content.trim(),
          chatId: chatId,
          authorUid: authorUid,
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          readBy: true,
          replyTo: {
            include: {
              author: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Update chat's lastMessage and lastActivity
      await tx.chat.update({
        where: { id: chatId },
        data: {
          lastMessageId: newMessage.id,
          lastActivity: new Date(),
        },
      });

      return newMessage;
    });

    // Transform for UI
    return transformMessageForChat(message as MessageWithRelations, authorUid);
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Edit a message
 */
export async function editMessage(
  messageId: string,
  content: string,
  userId: string
): Promise<void> {
  try {
    // Get the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.authorUid !== userId) {
      throw new Error('You can only edit your own messages');
    }

    if (message.deleted) {
      throw new Error('Cannot edit a deleted message');
    }

    // Update message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
        edited: true,
        editedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<void> {
  try {
    // Get the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.authorUid !== userId) {
      throw new Error('You can only delete your own messages');
    }

    // Soft delete message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

/**
 * Mark messages as read (batch operation)
 */
export async function markAsRead(
  messageIds: string[],
  userId: string
): Promise<void> {
  try {
    if (messageIds.length === 0) return;

    // Create MessageRead records (upsert to avoid duplicates)
    await prisma.$transaction(
      messageIds.map((messageId) =>
        prisma.messageRead.upsert({
          where: {
            messageId_uid: {
              messageId: messageId,
              uid: userId,
            },
          },
          create: {
            messageId: messageId,
            uid: userId,
          },
          update: {
            readAt: new Date(),
          },
        })
      )
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw new Error('Failed to mark messages as read');
  }
}

/**
 * Get unread message count for a chat
 */
export async function getUnreadCount(
  chatId: string,
  userId: string
): Promise<number> {
  try {
    // Count messages where:
    // - chatId matches
    // - author is NOT current user
    // - no MessageRead record for current user
    const count = await prisma.message.count({
      where: {
        chatId: chatId,
        authorUid: {
          not: userId,
        },
        deleted: false,
        readBy: {
          none: {
            uid: userId,
          },
        },
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}
