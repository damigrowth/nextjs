'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { resolveTaxonomyHierarchy } from '@/lib/utils/datasets';

import {
  adminListProfilesSchema,
  adminUpdateProfileSchema,
  adminToggleProfileSchema,
  adminDeleteProfileSchema,
  adminUpdateVerificationSchema,
  type AdminListProfilesInput,
  type AdminUpdateProfileInput,
  type AdminToggleProfileInput,
  type AdminDeleteProfileInput,
  type AdminUpdateVerificationInput,
} from '@/lib/validations/admin';
import { getAdminSession } from './helpers';

/**
 * List profiles with filters and pagination
 */
export async function listProfiles(
  params: Partial<AdminListProfilesInput> = {},
) {
  try {
    await getAdminSession();

    const validatedParams = adminListProfilesSchema.parse(params);

    const {
      searchQuery,
      type,
      category,
      subcategory,
      published,
      verified,
      featured,
      status,
      limit,
      offset,
      sortBy,
      sortDirection,
    } = validatedParams;

    // Build where clause
    const where: any = {};

    // Search filter
    if (searchQuery) {
      where.OR = [
        { username: { contains: searchQuery, mode: 'insensitive' } },
        { displayName: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
      ];
    }

    // Type filter
    if (type && type !== 'all') {
      where.type = type;
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      where.subcategory = subcategory;
    }

    // Published filter
    if (published && published !== 'all') {
      where.published = published === 'published';
    }

    // Verified filter
    if (verified && verified !== 'all') {
      where.verified = verified === 'verified';
    }

    // Featured filter
    if (featured && featured !== 'all') {
      where.featured = featured === 'featured';
    }

    // Status filter (featured or top)
    if (status && status !== 'all') {
      if (status === 'featured') {
        where.featured = true;
      } else if (status === 'top') {
        where.top = true;
      }
    }

    // Execute query
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              banned: true,
              blocked: true,
              name: true,
            },
          },
          verification: true,
          _count: {
            select: {
              services: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortDirection,
        },
        take: limit,
        skip: offset,
      }),
      prisma.profile.count({ where }),
    ]);

    // Transform profiles to include category labels
    const transformedProfiles = profiles.map((profile) => ({
      ...profile,
      categoryLabels: resolveTaxonomyHierarchy(
        proTaxonomies,
        profile.category,
        profile.subcategory,
        null, // no subdivision for profiles
      ),
    }));

    return {
      success: true,
      data: {
        profiles: transformedProfiles,
        total,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error('Error listing profiles:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to list profiles',
    };
  }
}

/**
 * Get a single profile by ID with full details
 */
export async function getProfile(profileId: string) {
  try {
    await getAdminSession();

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: true,
        verification: true,
        services: {
          select: {
            id: true,
            title: true,
            status: true,
            rating: true,
            reviewCount: true,
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            services: true,
            reviews: true,
            chatsCreated: true,
          },
        },
      },
    });

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile',
    };
  }
}

/**
 * Update profile data
 */
export async function updateProfile(params: AdminUpdateProfileInput) {
  try {
    await getAdminSession();

    const validatedParams = adminUpdateProfileSchema.parse(params);

    const { profileId, ...updateData } = validatedParams;

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined),
    );

    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: cleanData,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            banned: true,
            blocked: true,
          },
        },
        verification: true,
        _count: {
          select: {
            services: true,
            reviews: true,
          },
        },
      },
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

/**
 * Toggle profile published status
 */
export async function togglePublished(params: AdminToggleProfileInput) {
  try {
    await getAdminSession();

    const validatedParams = adminToggleProfileSchema.parse(params);

    const currentProfile = await prisma.profile.findUnique({
      where: { id: validatedParams.profileId },
      select: { published: true },
    });

    if (!currentProfile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    const profile = await prisma.profile.update({
      where: { id: validatedParams.profileId },
      data: { published: !currentProfile.published },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            banned: true,
            blocked: true,
          },
        },
      },
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Error toggling published status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to toggle published status',
    };
  }
}

/**
 * Toggle profile featured status
 */
export async function toggleFeatured(params: AdminToggleProfileInput) {
  try {
    await getAdminSession();

    const validatedParams = adminToggleProfileSchema.parse(params);

    const currentProfile = await prisma.profile.findUnique({
      where: { id: validatedParams.profileId },
      select: { featured: true },
    });

    if (!currentProfile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    const profile = await prisma.profile.update({
      where: { id: validatedParams.profileId },
      data: { featured: !currentProfile.featured },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            banned: true,
            blocked: true,
          },
        },
      },
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to toggle featured status',
    };
  }
}

/**
 * Toggle profile verified status
 */
export async function toggleVerified(params: AdminToggleProfileInput) {
  try {
    await getAdminSession();

    const validatedParams = adminToggleProfileSchema.parse(params);

    const currentProfile = await prisma.profile.findUnique({
      where: { id: validatedParams.profileId },
      select: {
        verified: true,
        verification: true,
      },
    });

    if (!currentProfile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    const newVerifiedStatus = !currentProfile.verified;

    // Update profile
    const profile = await prisma.profile.update({
      where: { id: validatedParams.profileId },
      data: { verified: newVerifiedStatus },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            banned: true,
            blocked: true,
          },
        },
        verification: true,
      },
    });

    // Update verification record if it exists
    if (currentProfile.verification) {
      await prisma.profileVerification.update({
        where: { pid: validatedParams.profileId },
        data: {
          status: newVerifiedStatus ? 'APPROVED' : 'PENDING',
        },
      });
    }

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Error toggling verified status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to toggle verified status',
    };
  }
}

/**
 * Update verification status
 */
export async function updateVerificationStatus(
  params: AdminUpdateVerificationInput,
) {
  try {
    await getAdminSession();

    const validatedParams = adminUpdateVerificationSchema.parse(params);

    const { profileId, status, notes } = validatedParams;

    // Check if verification record exists
    const existingVerification = await prisma.profileVerification.findUnique({
      where: { pid: profileId },
    });

    let verification;

    if (existingVerification) {
      // Update existing verification
      verification = await prisma.profileVerification.update({
        where: { pid: profileId },
        data: {
          status,
          // Could add notes field to schema if needed
        },
      });
    } else {
      // Get profile to get uid
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        select: { uid: true },
      });

      if (!profile) {
        return {
          success: false,
          error: 'Profile not found',
        };
      }

      // Create new verification record
      verification = await prisma.profileVerification.create({
        data: {
          pid: profileId,
          uid: profile.uid,
          status,
        },
      });
    }

    // Update profile verified status
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        verified: status === 'APPROVED',
      },
    });

    return {
      success: true,
      data: verification,
    };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update verification status',
    };
  }
}

/**
 * Delete profile
 */
export async function deleteProfile(params: AdminDeleteProfileInput) {
  try {
    await getAdminSession();

    const validatedParams = adminDeleteProfileSchema.parse(params);

    // Get profile with counts
    const profile = await prisma.profile.findUnique({
      where: { id: validatedParams.profileId },
      include: {
        _count: {
          select: {
            services: true,
            reviews: true,
            chatsCreated: true,
          },
        },
      },
    });

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    // Delete profile (cascades will handle related records)
    await prisma.profile.delete({
      where: { id: validatedParams.profileId },
    });

    return {
      success: true,
      data: {
        deletedProfile: profile,
        cascadeInfo: {
          services: profile._count.services,
          reviews: profile._count.reviews,
          chats: profile._count.chatsCreated,
        },
      },
    };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete profile',
    };
  }
}

/**
 * Get profile statistics
 */
export async function getProfileStats() {
  try {
    await getAdminSession();

    const [total, published, featured, verified, unverified, top, professional, company] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { published: true } }),
      prisma.profile.count({ where: { featured: true } }),
      prisma.profile.count({ where: { verified: true } }),
      prisma.profile.count({ where: { verified: false } }),
      prisma.profile.count({ where: { top: true } }),
      prisma.profile.count({ where: { type: 'freelancer' } }),
      prisma.profile.count({ where: { type: 'company' } }),
    ]);

    return {
      success: true,
      data: {
        total,
        published,
        featured,
        verified,
        unverified,
        top,
        professional,
        company,
      },
    };
  } catch (error) {
    console.error('Error getting profile stats:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get profile stats',
    };
  }
}
