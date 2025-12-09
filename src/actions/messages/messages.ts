'use server';

import { prisma } from '@/lib/prisma/client';
import { transformMessageForChat } from '@/lib/utils/messages';
import type { ChatMessageItem, MessageWithRelations } from '@/lib/types/messages';
import { sendUnreadMessagesEmail } from '@/lib/email/services/message-emails';
import { MESSAGE_WITH_AUTHOR_INCLUDE } from '@/lib/database/selects';

/**
 * Get messages for a chat with pagination support
 */
export async function getMessages(
  chatId: string,
  currentUserId: string,
  options?: { limit?: number; before?: string }
): Promise<ChatMessageItem[]> {
  try {
    const limit = options?.limit || 20;

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

    // Fetch messages with relations (excluding deleted messages)
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
        deleted: false, // Filter out deleted messages
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
        createdAt: 'desc', // Get newest messages first
      },
      take: limit,
    });

    // Transform messages for UI display
    const chatMessages = messages.map((message) =>
      transformMessageForChat(message as MessageWithRelations, currentUserId)
    );

    // Reverse to display oldest→newest (bottom of chat shows most recent)
    return chatMessages.reverse();
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
  authorUid: string,
  replyToId?: string
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

    // If replying, verify the parent message exists in the same chat
    if (replyToId) {
      const parentMessage = await prisma.message.findUnique({
        where: { id: replyToId },
      });

      if (!parentMessage || parentMessage.chatId !== chatId) {
        throw new Error('Invalid reply target');
      }
    }

    // Create the message and update chat in a transaction
    const message = await prisma.$transaction(async (tx) => {
      // Create message
      const newMessage = await tx.message.create({
        data: {
          content: content.trim(),
          chatId: chatId,
          authorUid: authorUid,
          ...(replyToId && { replyToId }),
        },
        include: MESSAGE_WITH_AUTHOR_INCLUDE,
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

    // Check if we should trigger unread messages email notification (async, non-blocking)
    checkAndSendUnreadEmailNotification(chatId, authorUid).catch((error) => {
      console.error('[Email] Failed to check/send unread email notification:', error);
      // Don't throw - email failure shouldn't break message send
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

    // Update messages to mark as read
    // Only update messages not sent by the current user
    await prisma.message.updateMany({
      where: {
        id: {
          in: messageIds,
        },
        authorUid: {
          not: userId,
        },
      },
      data: {
        read: true,
      },
    });
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
    // - message is not read
    const count = await prisma.message.count({
      where: {
        chatId: chatId,
        authorUid: {
          not: userId,
        },
        deleted: false,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get total unread message count across all chats for a user
 * Optimized with single aggregation query
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  try {
    // Get all chats where user is a member
    const userChats = await prisma.chatMember.findMany({
      where: { uid: userId },
      select: { chatId: true },
    });

    const chatIds = userChats.map((cm) => cm.chatId);

    if (chatIds.length === 0) {
      return 0;
    }

    // Count all unread messages across user's chats in a single query
    const count = await prisma.message.count({
      where: {
        chatId: {
          in: chatIds,
        },
        authorUid: {
          not: userId,
        },
        deleted: false,
        read: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return 0;
  }
}

/**
 * Get recent unread messages for a user from the last N minutes
 * Used for email notification context
 */
export async function getRecentUnreadMessages(
  userId: string,
  minutes: number = 15
): Promise<
  Array<{
    id: string;
    content: string;
    createdAt: Date;
    chatId: string;
    author: {
      id: string;
      displayName: string | null;
      username: string | null;
      image: string | null;
    };
  }>
> {
  try {
    // Calculate time threshold
    const timeThreshold = new Date();
    timeThreshold.setMinutes(timeThreshold.getMinutes() - minutes);

    // Get all chats where user is a member
    const userChats = await prisma.chatMember.findMany({
      where: { uid: userId },
      select: { chatId: true },
    });

    const chatIds = userChats.map((cm) => cm.chatId);

    if (chatIds.length === 0) {
      return [];
    }

    // Fetch recent unread messages with author info
    const messages = await prisma.message.findMany({
      where: {
        chatId: {
          in: chatIds,
        },
        authorUid: {
          not: userId,
        },
        deleted: false,
        createdAt: {
          gte: timeThreshold,
        },
        read: false,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return messages;
  } catch (error) {
    console.error('Error getting recent unread messages:', error);
    return [];
  }
}

/**
 * Manage email batch state when a message is sent
 * Creates or updates EmailBatch records for 15-minute collection windows
 *
 * Note: Email sending is handled by Vercel cron job (/api/cron/process-email-batches)
 * that runs every 15 minutes automatically
 *
 * This is called asynchronously after sending a message (non-blocking)
 */
async function checkAndSendUnreadEmailNotification(
  chatId: string,
  senderUid: string
): Promise<void> {
  try {
    // Get the other member(s) in the chat (recipients)
    const chatMembers = await prisma.chatMember.findMany({
      where: {
        chatId: chatId,
        uid: {
          not: senderUid, // Exclude the sender
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Check each recipient
    for (const member of chatMembers) {
      const recipient = member.user;

      // Check for existing unprocessed email batch
      const batch = await prisma.emailBatch.findFirst({
        where: {
          userId: recipient.id,
          processed: false,
        },
        orderBy: {
          firstMessageAt: 'desc',
        },
      });

      if (!batch) {
        // No active batch - create new one (start 15-minute collection window)
        await prisma.emailBatch.create({
          data: {
            userId: recipient.id,
            firstMessageAt: new Date(),
            messageCount: 1,
          },
        });

        console.log(
          `[Email Batch] Started new 15-minute collection window for user ${recipient.id}`
        );
      } else {
        // Batch exists - increment message count
        const minutesSinceFirst =
          (Date.now() - new Date(batch.firstMessageAt).getTime()) / (1000 * 60);

        await prisma.emailBatch.update({
          where: { id: batch.id },
          data: {
            messageCount: { increment: 1 },
          },
        });

        console.log(
          `[Email Batch] Added message to batch for user ${recipient.id} (${Math.floor(minutesSinceFirst)} min elapsed, cron will send at 15 min)`
        );
      }
    }
  } catch (error) {
    console.error('[Email] Error in checkAndSendUnreadEmailNotification:', error);
    // Don't throw - this is a background task
  }
}
