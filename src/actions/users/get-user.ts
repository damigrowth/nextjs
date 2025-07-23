'use server';

import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { ActionResult } from '@/lib/types/api';
import { User } from '@/lib/types/user';
import { requireAuth } from '../auth/check-auth';

const prisma = new PrismaClient();

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<ActionResult<User | null>> {
  try {
    const currentUser = await requireAuth();
    
    // Only allow users to get their own data, or admins to get any user's data
    if (currentUser.id !== userId && (currentUser as any).role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized access',
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            avatar: true,
            portfolio: true,
          },
        },
        sessions: {
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        accounts: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: user as User,
    };
  } catch (error: any) {
    console.error('Get user error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user',
    };
  }
}

/**
 * Get current authenticated user with full data
 */
export async function getCurrentUserFull(): Promise<ActionResult<User | null>> {
  try {
    const session = await auth.api.getSession({
      headers: {
        // Better Auth will handle getting the session from cookies
      }
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    return getUser(session.user.id);
  } catch (error: any) {
    console.error('Get current user full error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get current user',
    };
  }
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string): Promise<ActionResult<any | null>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            avatar: true,
            portfolio: true,
          },
        },
      },
    });

    if (!user || !user.profile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    // Only return public profile data for non-owners
    const currentUserResult = await requireAuth();
    const isOwner = currentUserResult.id === userId;
    const isAdmin = (currentUserResult as any).role === 'admin';

    if (!isOwner && !isAdmin && !user.profile.published) {
      return {
        success: false,
        error: 'Profile not accessible',
      };
    }

    return {
      success: true,
      data: user.profile,
    };
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user profile',
    };
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string): Promise<ActionResult<any>> {
  try {
    const currentUser = await requireAuth();
    
    // Only allow users to get their own stats, or admins to get any user's stats
    if (currentUser.id !== userId && (currentUser as any).role !== 'admin') {
      return {
        success: false,
        error: 'Unauthorized access',
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            _count: {
              select: {
                services: true,
                reviews: true,
                receivedReviews: true,
              },
            },
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const stats = {
      totalSessions: user._count.sessions,
      profileStats: user.profile ? {
        totalServices: user.profile._count?.services || 0,
        totalReviews: user.profile._count?.reviews || 0,
        totalReceivedReviews: user.profile._count?.receivedReviews || 0,
        averageRating: user.profile.rating,
        isVerified: user.profile.verified,
        isFeatured: user.profile.featured,
      } : null,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error: any) {
    console.error('Get user stats error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get user statistics',
    };
  }
}