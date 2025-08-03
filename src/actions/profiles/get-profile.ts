'use server';

import { PrismaClient, Profile } from '@prisma/client';
import { ActionResult } from '@/lib/types/api';

const prisma = new PrismaClient();

/**
 * Get user profile with all relations by user ID (authenticated)
 */
export async function getProfileByUserId(userId: string): Promise<ActionResult<Profile | null>> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { uid: userId },
      include: {
        services: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          include: {
            author: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        chatMemberships: {
          include: {
            chat: true,
          },
        },
      },
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: 'Failed to get profile',
    };
  }
}

/**
 * Get public profile by username (no authentication required)
 */
export async function getPublicProfileByUsername(username: string): Promise<ActionResult<Profile | null>> {
  try {
    const profile = await prisma.profile.findFirst({
      where: { 
        username: username,
        published: true, // Only show published profiles
      },
      include: {
        services: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
        },
        reviewsReceived: {
          where: { published: true }, // Only show published reviews
          include: {
            author: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        // Don't include chat memberships for public profiles
      },
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Get public profile error:', error);
    return {
      success: false,
      error: 'Failed to get public profile',
    };
  }
}