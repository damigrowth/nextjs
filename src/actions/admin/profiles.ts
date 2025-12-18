'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';
import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_TAGS, getProfileTags } from '@/lib/cache';
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

    // Transform profiles to include taxonomy labels
    const transformedProfiles = profiles.map((profile) => ({
      ...profile,
      taxonomyLabels: resolveTaxonomyHierarchy(
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
      select: {
        featured: true,
        id: true,
        uid: true,
        username: true,
      },
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

    // Revalidate profile tags
    const profileTags = getProfileTags({
      id: currentProfile.id,
      uid: currentProfile.uid,
      username: currentProfile.username,
    });
    profileTags.forEach((tag) => revalidateTag(tag));

    // Revalidate home page (featured profiles)
    revalidateTag(CACHE_TAGS.home);

    // Revalidate archive pages
    revalidateTag(CACHE_TAGS.archive.all);
    revalidateTag(CACHE_TAGS.collections.profiles);

    // Revalidate paths
    revalidatePath('/'); // Home page
    revalidatePath('/dir'); // Directory page
    if (currentProfile.username) {
      revalidatePath(`/profile/${currentProfile.username}`);
    }

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
 * Search profiles for selection dropdown (unlimited search across all profiles)
 */
export async function searchProfilesForSelection(searchQuery: string) {
  try {
    await getAdminSession();

    // Validate search query
    if (!searchQuery || searchQuery.trim().length < 2) {
      return {
        success: true,
        data: [],
      };
    }

    const trimmedQuery = searchQuery.trim();

    // Search ALL profiles matching query (no pagination)
    // Filter by role and search across displayName, email, username
    const profiles = await prisma.profile.findMany({
      where: {
        AND: [
          // Only freelancers and companies
          {
            user: {
              role: {
                in: ['freelancer', 'company'],
              },
            },
          },
          // Search across multiple fields
          {
            OR: [
              { username: { contains: trimmedQuery, mode: 'insensitive' } },
              { displayName: { contains: trimmedQuery, mode: 'insensitive' } },
              { email: { contains: trimmedQuery, mode: 'insensitive' } },
              { user: { email: { contains: trimmedQuery, mode: 'insensitive' } } },
            ],
          },
        ],
      },
      select: {
        id: true,
        uid: true,
        username: true,
        displayName: true,
        email: true,
        image: true,
        coverage: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      // Limit to 50 results for performance (reasonable for dropdown)
      take: 50,
      orderBy: {
        displayName: 'asc',
      },
    });

    return {
      success: true,
      data: profiles,
    };
  } catch (error) {
    console.error('Error searching profiles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search profiles',
      data: [],
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

/**
 * Update profile settings (boolean flags) - FormData version for useActionState
 */
export async function updateProfileSettingsAction(
  prevState: any,
  formData: FormData,
): Promise<any> {
  try {
    await getAdminSession();

    const profileId = formData.get('profileId');

    if (!profileId || typeof profileId !== 'string') {
      return {
        success: false,
        error: 'Profile ID is required',
      };
    }

    // Parse FormData - all boolean fields
    const rawData = {
      published: formData.get('published') === 'true',
      featured: formData.get('featured') === 'true',
      verified: formData.get('verified') === 'true',
      top: formData.get('top') === 'true',
      isActive: formData.get('isActive') === 'true',
    };

    // Validate - create a schema for settings fields only
    const settingsSchema = z.object({
      published: z.boolean(),
      featured: z.boolean(),
      verified: z.boolean(),
      top: z.boolean(),
      isActive: z.boolean(),
    });

    const validationResult = settingsSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Settings validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    // Get current profile data for cache invalidation
    const currentProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        uid: true,
        username: true,
      },
    });

    if (!currentProfile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    // Update profile with validated data
    const profile = await prisma.profile.update({
      where: { id: profileId },
      data: validationResult.data,
    });

    // Revalidate profile tags
    const profileTags = getProfileTags({
      id: currentProfile.id,
      uid: currentProfile.uid,
      username: currentProfile.username,
    });
    profileTags.forEach((tag) => revalidateTag(tag));

    // Revalidate home page (featured profiles)
    revalidateTag(CACHE_TAGS.home);

    // Revalidate archive pages
    revalidateTag(CACHE_TAGS.archive.all);
    revalidateTag(CACHE_TAGS.collections.profiles);

    // Revalidate paths
    revalidatePath('/'); // Home page
    revalidatePath('/dir'); // Directory page
    if (currentProfile.username) {
      revalidatePath(`/profile/${currentProfile.username}`);
    }

    return {
      success: true,
      message: 'Profile settings updated successfully',
      data: profile,
    };
  } catch (error) {
    console.error('Error updating profile settings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile settings',
    };
  }
}
