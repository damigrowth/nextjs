'use server';

import { PrismaClient } from '@prisma/client';
import { ActionResult } from '@/lib/types/api';
import { requireAuth, getCurrentUser } from '@/actions/auth/check-auth';

const prisma = new PrismaClient();

interface FreelancerProfile {
  id: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  tagline?: string;
  description?: string;
  website?: string;
  phone?: string;
  city?: string;
  county?: string;
  zipcode?: string;
  experience?: number;
  rate?: number;
  published: boolean;
  isActive: boolean;
  verified: boolean;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  client: {
    displayName: string;
  };
}

/**
 * Get current user's freelancer profile ID
 */
export async function getFreelancerId(): Promise<ActionResult<string | null>> {
  try {
    const user = await requireAuth();

    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: { id: true },
    });

    return {
      success: true,
      data: profile?.id || null,
    };
  } catch (error) {
    console.error('Get freelancer ID error:', error);
    return {
      success: false,
      error: 'Failed to get freelancer ID',
    };
  }
}

/**
 * Get current user's freelancer profile
 */
export async function getFreelancer(): Promise<ActionResult<FreelancerProfile | null>> {
  try {
    const user = await requireAuth();

    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
    });

    if (!profile) {
      return {
        success: true,
        data: null,
      };
    }

    const freelancerProfile: FreelancerProfile = {
      id: profile.id,
      username: profile.username || '',
      displayName: profile.displayName || '',
      firstName: profile.firstName || undefined,
      lastName: profile.lastName || undefined,
      tagline: profile.tagline || undefined,
      description: profile.description || undefined,
      website: profile.website || undefined,
      phone: profile.phone || undefined,
      city: profile.city || undefined,
      county: profile.county || undefined,
      zipcode: profile.zipcode || undefined,
      experience: profile.experience || undefined,
      rate: profile.rate || undefined,
      published: profile.published,
      isActive: profile.isActive,
      verified: profile.verified,
    };

    return {
      success: true,
      data: freelancerProfile,
    };
  } catch (error) {
    console.error('Get freelancer error:', error);
    return {
      success: false,
      error: 'Failed to get freelancer profile',
    };
  }
}

/**
 * Get freelancer profile by username
 */
export async function getFreelancerByUsername(username: string): Promise<ActionResult<FreelancerProfile | null>> {
  try {
    const profile = await prisma.profile.findFirst({
      where: { 
        username,
        published: true,
      },
    });

    if (!profile) {
      return {
        success: true,
        data: null,
      };
    }

    const freelancerProfile: FreelancerProfile = {
      id: profile.id,
      username: profile.username || '',
      displayName: profile.displayName || '',
      firstName: profile.firstName || undefined,
      lastName: profile.lastName || undefined,
      tagline: profile.tagline || undefined,
      description: profile.description || undefined,
      website: profile.website || undefined,
      phone: profile.phone || undefined,
      city: profile.city || undefined,
      county: profile.county || undefined,
      zipcode: profile.zipcode || undefined,
      experience: profile.experience || undefined,
      rate: profile.rate || undefined,
      published: profile.published,
      isActive: profile.isActive,
      verified: profile.verified,
    };

    return {
      success: true,
      data: freelancerProfile,
    };
  } catch (error) {
    console.error('Get freelancer by username error:', error);
    return {
      success: false,
      error: 'Failed to get freelancer profile',
    };
  }
}

/**
 * Get reviews for a freelancer
 */
export async function getReviewsByFreelancer(
  freelancerId: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<ActionResult<{ reviews: ReviewData[]; total: number; pages: number }>> {
  try {
    const skip = (page - 1) * pageSize;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { freelancerId },
        include: {
          client: {
            select: { displayName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.review.count({
        where: { freelancerId },
      }),
    ]);

    const reviewData: ReviewData[] = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      client: {
        displayName: review.client.displayName || 'Anonymous',
      },
    }));

    return {
      success: true,
      data: {
        reviews: reviewData,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error('Get reviews by freelancer error:', error);
    return {
      success: false,
      error: 'Failed to get reviews',
    };
  }
}

/**
 * Get all review ratings for a freelancer
 */
export async function getAllReviewsRatingsByFreelancer(
  freelancerId: string, 
  limit: number = 100
): Promise<ActionResult<{ ratings: number[]; average: number; count: number }>> {
  try {
    const reviews = await prisma.review.findMany({
      where: { freelancerId },
      select: { rating: true },
      take: limit,
    });

    const ratings = reviews.map(review => review.rating);
    const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      success: true,
      data: {
        ratings,
        average,
        count: ratings.length,
      },
    };
  } catch (error) {
    console.error('Get all reviews ratings error:', error);
    return {
      success: false,
      error: 'Failed to get review ratings',
    };
  }
}

/**
 * Get featured services by freelancer
 */
export async function getFeaturedServicesByFreelancer(
  freelancerId: string, 
  limit: number = 10
): Promise<ActionResult<any[]>> {
  try {
    // This would need to be implemented based on your service model
    // For now returning empty array
    const services: any[] = [];

    return {
      success: true,
      data: services,
    };
  } catch (error) {
    console.error('Get featured services error:', error);
    return {
      success: false,
      error: 'Failed to get featured services',
    };
  }
}

/**
 * Check freelancer activation status
 */
export async function getFreelancerActivationStatus(): Promise<ActionResult<{ freelancerId: string; isActive: boolean } | null>> {
  try {
    const userResult = await getCurrentUser();
    
    if (!userResult.success || !userResult.data) {
      return {
        success: true,
        data: null,
      };
    }

    const user = userResult.data as any;

    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: { id: true, isActive: true, published: true },
    });

    if (!profile) {
      return {
        success: true,
        data: null,
      };
    }

    // Check if user is a professional and profile is active
    const isProfessional = user.role === 'freelancer' || user.role === 'company';
    const isActive = isProfessional && profile.published && profile.isActive;

    return {
      success: true,
      data: {
        freelancerId: profile.id,
        isActive,
      },
    };
  } catch (error) {
    console.error('Get freelancer activation status error:', error);
    return {
      success: false,
      error: 'Failed to get freelancer activation status',
    };
  }
}