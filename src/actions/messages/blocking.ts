'use server';

import { prisma } from '@/lib/prisma/client';
import type { User } from '@prisma/client';

/**
 * Block a user
 */
export async function blockUser(
  blockerId: string,
  blockedId: string
): Promise<void> {
  try {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Create BlockedUser record (upsert to handle duplicates)
    await prisma.blockedUser.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: blockerId,
          blockedId: blockedId,
        },
      },
      create: {
        blockerId: blockerId,
        blockedId: blockedId,
      },
      update: {
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    throw new Error('Failed to block user');
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(
  blockerId: string,
  blockedId: string
): Promise<void> {
  try {
    // Delete BlockedUser record
    await prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: blockerId,
          blockedId: blockedId,
        },
      },
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw new Error('Failed to unblock user');
  }
}

/**
 * Get all users current user has blocked
 */
export async function getBlockedUsers(userId: string): Promise<
  Array<{
    id: string;
    blockedId: string;
    blocked: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'image'>;
    createdAt: Date;
  }>
> {
  try {
    const blockedUsers = await prisma.blockedUser.findMany({
      where: {
        blockerId: userId,
      },
      select: {
        id: true,
        blockedId: true,
        createdAt: true,
        blocked: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return blockedUsers;
  } catch (error) {
    console.error('Error getting blocked users:', error);
    return [];
  }
}

/**
 * Check if either user has blocked the other
 */
export async function isBlocked(
  userId: string,
  otherUserId: string
): Promise<boolean> {
  try {
    const blocked = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: otherUserId },
          { blockerId: otherUserId, blockedId: userId },
        ],
      },
    });

    return !!blocked;
  } catch (error) {
    console.error('Error checking if blocked:', error);
    return false;
  }
}
