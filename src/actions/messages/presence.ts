'use server';

import { prisma } from '@/lib/prisma/client';

/**
 * Update user's online presence status in all their chats
 */
export async function updatePresence(
  userId: string,
  online: boolean
): Promise<void> {
  try {
    // Update all ChatMember records for this user
    await prisma.chatMember.updateMany({
      where: {
        uid: userId,
      },
      data: {
        online: online,
        lastSeen: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating presence:', error);
    throw new Error('Failed to update presence');
  }
}

/**
 * Get user's current presence status
 */
export async function getPresenceStatus(userId: string): Promise<{
  online: boolean;
  lastSeen: Date;
}> {
  try {
    // Get any ChatMember record for this user to check presence
    const chatMember = await prisma.chatMember.findFirst({
      where: {
        uid: userId,
      },
      select: {
        online: true,
        lastSeen: true,
      },
    });

    if (!chatMember) {
      return {
        online: false,
        lastSeen: new Date(),
      };
    }

    return {
      online: chatMember.online,
      lastSeen: chatMember.lastSeen,
    };
  } catch (error) {
    console.error('Error getting presence status:', error);
    return {
      online: false,
      lastSeen: new Date(),
    };
  }
}

/**
 * Get all chats user is in with their presence status
 */
export async function getUserChatsWithPresence(userId: string): Promise<
  Array<{
    chatId: string;
    online: boolean;
  }>
> {
  try {
    // Get all chat memberships
    const chatMembers = await prisma.chatMember.findMany({
      where: {
        uid: userId,
      },
      select: {
        chatId: true,
        online: true,
      },
    });

    return chatMembers;
  } catch (error) {
    console.error('Error getting user chats with presence:', error);
    return [];
  }
}
