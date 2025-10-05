'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

import {
  adminListServicesSchema,
  adminUpdateServiceSchema,
  adminToggleServiceSchema,
  adminUpdateServiceStatusSchema,
  adminDeleteServiceSchema,
  type AdminListServicesInput,
  type AdminUpdateServiceInput,
  type AdminToggleServiceInput,
  type AdminUpdateServiceStatusInput,
  type AdminDeleteServiceInput,
} from '@/lib/validations/admin';

// Helper function to get authenticated admin session
async function getAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'admin';

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin role required');
  }

  return session;
}

/**
 * List services with filters and pagination
 */
export async function listServices(
  params: Partial<AdminListServicesInput> = {},
) {
  try {
    await getAdminSession();

    const validated = adminListServicesSchema.parse(params);
    const {
      searchQuery,
      status,
      category,
      subcategory,
      subdivision,
      featured,
      profileId,
      limit,
      offset,
      sortBy,
      sortDirection,
    } = validated;

    // Build where clause
    const where: any = {};

    // Search query (title or description)
    if (searchQuery) {
      where.OR = [
        { titleNormalized: { contains: searchQuery.toLowerCase() } },
        { descriptionNormalized: { contains: searchQuery.toLowerCase() } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Category filters
    if (category) {
      where.category = category;
    }
    if (subcategory) {
      where.subcategory = subcategory;
    }
    if (subdivision) {
      where.subdivision = subdivision;
    }

    // Featured filter
    if (featured === 'featured') {
      where.featured = true;
    } else if (featured === 'not-featured') {
      where.featured = false;
    }

    // Profile filter
    if (profileId) {
      where.pid = profileId;
    }

    // Get total count
    const total = await prisma.service.count({ where });

    // Get services (media is a JSON field, not a relation, so it's included by default)
    const services = await prisma.service.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            displayName: true,
            type: true,
            username: true,
            category: true,
            subcategory: true,
            image: true,
            user: {
              select: {
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortDirection,
      },
      take: limit,
      skip: offset,
    });

    // Transform services to include categoryLabels for TaxonomiesDisplay
    const servicesWithLabels = services.map((service) => {
      // Find category label by matching id
      const categoryData = serviceTaxonomies.find((cat) => cat.id === service.category);
      const subcategoryData = categoryData?.children?.find(
        (sub) => sub.id === service.subcategory,
      );
      const subdivisionData = subcategoryData?.children?.find(
        (div) => div.id === service.subdivision,
      );

      return {
        ...service,
        categoryLabels: {
          category: categoryData?.label || service.category,
          subcategory: subcategoryData?.label || service.subcategory,
          subdivision: subdivisionData?.label || service.subdivision,
        },
      };
    });

    return {
      success: true,
      data: {
        services: servicesWithLabels,
        total,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error('Error listing services:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        details: error.issues,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list services',
    };
  }
}

/**
 * Get single service details
 */
export async function getService(serviceId: number) {
  try {
    await getAdminSession();

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        profile: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
                role: true,
                banned: true,
                blocked: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            profile: {
              select: {
                displayName: true,
                username: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error('Error getting service:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get service',
    };
  }
}

/**
 * Update service
 */
export async function updateService(params: AdminUpdateServiceInput) {
  try {
    await getAdminSession();

    const validated = adminUpdateServiceSchema.parse(params);
    const { serviceId, ...updateData } = validated;

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Update normalized fields if title or description changed
    const normalizedUpdates: any = {};
    if (updateData.title) {
      normalizedUpdates.titleNormalized = updateData.title.toLowerCase();
    }
    if (updateData.description) {
      normalizedUpdates.descriptionNormalized =
        updateData.description.toLowerCase();
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...updateData,
        ...normalizedUpdates,
      },
      include: {
        profile: {
          select: {
            displayName: true,
            username: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedService,
      message: 'Service updated successfully',
    };
  } catch (error) {
    console.error('Error updating service:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        details: error.issues,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service',
    };
  }
}

/**
 * Toggle service published status
 */
export async function togglePublished(params: AdminToggleServiceInput) {
  try {
    await getAdminSession();

    const validated = adminToggleServiceSchema.parse(params);
    const { serviceId } = validated;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { status: true },
    });

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Toggle between published and draft
    const newStatus = service.status === 'published' ? 'draft' : 'published';

    await prisma.service.update({
      where: { id: serviceId },
      data: { status: newStatus },
    });

    return {
      success: true,
      message: `Service ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling published status:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        details: error.issues,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to toggle published status',
    };
  }
}

/**
 * Toggle service featured status
 */
export async function toggleFeatured(params: AdminToggleServiceInput) {
  try {
    await getAdminSession();

    const validated = adminToggleServiceSchema.parse(params);
    const { serviceId } = validated;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { featured: true },
    });

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { featured: !service.featured },
    });

    return {
      success: true,
      message: `Service ${!service.featured ? 'featured' : 'unfeatured'} successfully`,
    };
  } catch (error) {
    console.error('Error toggling featured status:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        details: error.issues,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to toggle featured status',
    };
  }
}

/**
 * Update service status (approve/reject/etc)
 */
export async function updateServiceStatus(
  params: AdminUpdateServiceStatusInput,
) {
  try {
    await getAdminSession();

    const validated = adminUpdateServiceStatusSchema.parse(params);
    const { serviceId, status, rejectionReason } = validated;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Update status
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        status,
        // Store rejection reason in a metadata field if needed
        // This assumes you might add a metadata or notes field to the Service model
      },
    });

    return {
      success: true,
      message: `Service status updated to ${status}`,
    };
  } catch (error) {
    console.error('Error updating service status:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        details: error.issues,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update service status',
    };
  }
}

/**
 * Delete service
 */
export async function deleteService(params: AdminDeleteServiceInput) {
  try {
    await getAdminSession();

    const validated = adminDeleteServiceSchema.parse(params);
    const { serviceId } = validated;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return {
        success: false,
        error: 'Service not found',
      };
    }

    // Delete service (cascade will handle reviews)
    await prisma.service.delete({
      where: { id: serviceId },
    });

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting service:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        details: error.issues,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete service',
    };
  }
}

/**
 * Get service statistics
 */
export async function getServiceStats() {
  try {
    await getAdminSession();

    const [
      total,
      published,
      draft,
      pending,
      rejected,
      approved,
      inactive,
      featured,
    ] = await Promise.all([
      prisma.service.count(),
      prisma.service.count({ where: { status: 'published' } }),
      prisma.service.count({ where: { status: 'draft' } }),
      prisma.service.count({ where: { status: 'pending' } }),
      prisma.service.count({ where: { status: 'rejected' } }),
      prisma.service.count({ where: { status: 'approved' } }),
      prisma.service.count({ where: { status: 'inactive' } }),
      prisma.service.count({ where: { featured: true } }),
    ]);

    // Get category breakdown
    const servicesByCategory = await prisma.service.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
      take: 10,
    });

    return {
      success: true,
      data: {
        total,
        published,
        draft,
        pending,
        rejected,
        approved,
        inactive,
        featured,
        byCategory: servicesByCategory.map((cat) => ({
          category: cat.category,
          count: cat._count,
        })),
      },
    };
  } catch (error) {
    console.error('Error getting service stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get service stats',
    };
  }
}
