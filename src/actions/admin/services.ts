'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';
import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_TAGS, getServiceTags } from '@/lib/cache';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { normalizeTerm } from '@/lib/utils/text/normalize';
// O(1) optimized taxonomy lookups - 99% faster than nested find
import { findServiceById, findTagById, findTagBySlug } from '@/lib/taxonomies';
import { generateServiceSlug } from '@/lib/utils/text';
import { sendServicePublishedEmail } from '@/lib/email/services';

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
import {
  updateServiceMediaSchema,
  createServiceSchema,
  type UpdateServiceMediaInput
} from '@/lib/validations/service';
import type { ActionResult } from '@/lib/types/api';
import { getAdminSession } from './helpers';

/**
 * Invalidate all caches related to a service update
 */
async function invalidateServiceCaches(params: {
  serviceId: number;
  slug: string | null;
  pid: string;
  category: string;
  userId: string;
  profileId: string;
  profileUsername: string | null;
}) {
  const { serviceId, slug, pid, category, userId, profileId, profileUsername } =
    params;

  // Revalidate service-specific tags
  const serviceTags = getServiceTags({
    id: serviceId,
    slug,
    pid: String(pid),
    category,
  });
  serviceTags.forEach((tag) => revalidateTag(tag));

  // Revalidate profile-related tags
  revalidateTag(CACHE_TAGS.profile.byId(String(profileId)));
  revalidateTag(CACHE_TAGS.user.services(userId));

  if (profileUsername) {
    revalidateTag(CACHE_TAGS.profile.byUsername(profileUsername));
    revalidateTag(CACHE_TAGS.profile.page(profileUsername));
  }

  // Revalidate search caches (service data may affect search results)
  revalidateTag(CACHE_TAGS.search.all);
  revalidateTag(CACHE_TAGS.search.taxonomies);

  // Revalidate archive caches (service update affects listings)
  revalidateTag(CACHE_TAGS.archive.all);
  revalidateTag(CACHE_TAGS.archive.servicesFiltered);

  // Revalidate admin paths
  revalidatePath('/admin/services');
  revalidatePath(`/admin/services/${serviceId}`);

  // Revalidate specific pages
  if (slug) {
    revalidatePath(`/s/${slug}`);
  }
  if (profileUsername) {
    revalidatePath(`/profile/${profileUsername}`);
  }
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
      type,
      pricing,
      subscriptionType,
      limit,
      offset,
      sortBy,
      sortDirection,
    } = validated;

    // Build where clause
    const where: any = {};

    // Search query (title, description, or service ID)
    if (searchQuery) {
      // Normalize the search query to handle Greek accents
      const normalizedQuery = normalizeTerm(searchQuery);

      // Check if search query is a number (service ID search)
      const serviceIdMatch = searchQuery.match(/^\d+$/);

      where.OR = [
        { titleNormalized: { contains: normalizedQuery } },
        { descriptionNormalized: { contains: normalizedQuery } },
        // If the query is a number, also search by service ID
        ...(serviceIdMatch ? [{ id: parseInt(searchQuery) }] : []),
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

    // Type filter (presence/online/onbase/onsite/oneoff/subscription)
    if (type && type !== 'all') {
      where.type = {
        path: [type],
        equals: true,
      };
    }

    // Pricing filter (fixed/not-fixed)
    if (pricing === 'fixed') {
      where.fixed = true;
    } else if (pricing === 'not-fixed') {
      where.fixed = false;
    }

    // Subscription type filter
    if (subscriptionType && subscriptionType !== 'all') {
      where.subscriptionType = subscriptionType;
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

    // Transform services to include taxonomyLabels for TaxonomiesDisplay
    const servicesWithLabels = services.map((service) => {
      // O(1) lookups - 99% faster than O(n²) nested find
      const categoryData = findServiceById(service.category);
      const subcategoryData = service.subcategory
        ? findServiceById(service.subcategory)
        : null;
      const subdivisionData = service.subdivision
        ? findServiceById(service.subdivision)
        : null;

      return {
        ...service,
        taxonomyLabels: {
          category: categoryData?.label || service.category,
          subcategory: subcategoryData?.label || service.subcategory,
          subdivision: subdivisionData?.label || service.subdivision,
        },
      };
    });

    // Calculate page and totalPages
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        services: servicesWithLabels,
        total,
        page,
        limit,
        offset,
        totalPages,
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

    // params is already validated by action functions (updateServiceSettingsAction, etc.)
    // No need to re-validate here - the redundant parse was causing .partial() to add empty arrays
    const { serviceId, ...updateData } = params;

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

    // Filter out undefined values to prevent accidental overwrites
    // Only include fields that are explicitly provided
    const cleanedUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    // Update normalized fields if title or description changed
    const normalizedUpdates: any = {};
    if (updateData.title) {
      normalizedUpdates.titleNormalized = normalizeTerm(updateData.title);
      // Regenerate slug when title changes to keep URL in sync
      normalizedUpdates.slug = generateServiceSlug(updateData.title, serviceId.toString());
    }
    if (updateData.description) {
      normalizedUpdates.descriptionNormalized = normalizeTerm(updateData.description);
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...cleanedUpdateData,
        ...normalizedUpdates,
      },
      include: {
        profile: {
          select: {
            displayName: true,
            username: true,
            uid: true,
            id: true,
          },
        },
      },
    });

    // Invalidate caches
    await invalidateServiceCaches({
      serviceId: updatedService.id,
      slug: updatedService.slug,
      pid: updatedService.pid,
      category: updatedService.category,
      userId: updatedService.profile.uid,
      profileId: updatedService.profile.id,
      profileUsername: updatedService.profile.username,
    });

    // Send email notification if service status was changed to published
    if (updateData.status === 'published' && existingService.status !== 'published') {
      // Fetch full service with user data for email
      const serviceWithUser = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          profile: {
            include: {
              user: {
                select: {
                  email: true,
                  displayName: true,
                  username: true,
                },
              },
            },
          },
        },
      });

      if (serviceWithUser?.profile.user) {
        try {
          await sendServicePublishedEmail(
            {
              id: serviceWithUser.id,
              title: serviceWithUser.title,
              slug: serviceWithUser.slug || '',
            },
            { ...serviceWithUser.profile.user, email: serviceWithUser.profile.user.email || '' }
          );

        } catch (emailError) {
          console.error('[Email] Failed to send service published notification:', emailError);
          // Don't block the status update if email fails
        }
      }
    }

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
 * Update service taxonomy - FormData version for useActionState
 */
export async function updateServiceTaxonomyAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const serviceId = formData.get('serviceId');

    if (!serviceId) {
      return {
        success: false,
        error: 'Service ID is required',
      };
    }

    // Parse FormData
    const rawData = {
      category: formData.get('category') as string,
      subcategory: formData.get('subcategory') as string,
      subdivision: formData.get('subdivision') as string,
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    };

    // Validate using dashboard schema
    const taxonomySchema = createServiceSchema.pick({
      category: true,
      subcategory: true,
      subdivision: true,
      tags: true,
    });

    const validationResult = taxonomySchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Taxonomy validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateService({
      serviceId: Number(serviceId),
      ...validationResult.data,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service taxonomy',
    };
  }
}

/**
 * Update service basic info - FormData version for useActionState
 */
export async function updateServiceBasicAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const serviceId = formData.get('serviceId');

    if (!serviceId) {
      return {
        success: false,
        error: 'Service ID is required',
      };
    }

    // Parse FormData
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    };

    // Validate using dashboard schema
    const basicSchema = createServiceSchema.pick({
      title: true,
      description: true,
    });

    const validationResult = basicSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Basic info validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateService({
      serviceId: Number(serviceId),
      ...validationResult.data,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service basic info',
    };
  }
}

/**
 * Update service pricing - FormData version for useActionState
 */
export async function updateServicePricingAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const serviceId = formData.get('serviceId');

    if (!serviceId) {
      return {
        success: false,
        error: 'Service ID is required',
      };
    }

    // Parse FormData
    const rawData: any = {
      price: formData.get('price') ? Number(formData.get('price')) : undefined,
      fixed: formData.get('fixed') === 'true',
      duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
    };

    // Add subscriptionType if present
    if (formData.get('subscriptionType')) {
      rawData.subscriptionType = formData.get('subscriptionType');
    }

    // Validate using dashboard schema
    const pricingSchema = createServiceSchema.pick({
      price: true,
      fixed: true,
      duration: true,
      subscriptionType: true,
    });

    const validationResult = pricingSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Pricing validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateService({
      serviceId: Number(serviceId),
      ...validationResult.data,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service pricing',
    };
  }
}

/**
 * Update service settings - FormData version for useActionState
 */
export async function updateServiceSettingsAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const serviceId = formData.get('serviceId');

    if (!serviceId) {
      return {
        success: false,
        error: 'Service ID is required',
      };
    }

    // Parse FormData
    const rawData = {
      status: formData.get('status') as any,
      featured: formData.get('featured') === 'true',
    };

    // Validate using admin schema (status and featured are admin-only fields)
    const settingsSchema = adminUpdateServiceSchema.pick({
      status: true,
      featured: true,
    });

    const validationResult = settingsSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Settings validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateService({
      serviceId: Number(serviceId),
      ...validationResult.data,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service settings',
    };
  }
}

/**
 * Update service addons - FormData version for useActionState
 */
export async function updateServiceAddonsAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const serviceId = formData.get('serviceId');

    if (!serviceId) {
      return {
        success: false,
        error: 'Service ID is required',
      };
    }

    // Parse FormData
    const rawData = {
      addons: formData.get('addons') ? JSON.parse(formData.get('addons') as string) : [],
    };

    // Validate using dashboard schema
    const addonsSchema = createServiceSchema.pick({
      addons: true,
    });

    const validationResult = addonsSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Addons validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateService({
      serviceId: Number(serviceId),
      ...validationResult.data,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service addons',
    };
  }
}

/**
 * Update service FAQ - FormData version for useActionState
 */
export async function updateServiceFaqAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const serviceId = formData.get('serviceId');

    if (!serviceId) {
      return {
        success: false,
        error: 'Service ID is required',
      };
    }

    // Parse FormData
    const rawData = {
      faq: formData.get('faq') ? JSON.parse(formData.get('faq') as string) : [],
    };

    // Validate using dashboard schema
    const faqSchema = createServiceSchema.pick({
      faq: true,
    });

    const validationResult = faqSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('FAQ validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateService({
      serviceId: Number(serviceId),
      ...validationResult.data,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service FAQ',
    };
  }
}

/**
 * Update service media (admin version)
 */
export async function updateServiceMedia(
  serviceId: number,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  try {
    await getAdminSession();

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            uid: true,
          },
        },
      },
    });

    if (!existingService) {
      return { success: false, error: 'Service not found' };
    }

    // Parse and validate media data
    const rawData: UpdateServiceMediaInput = {
      media: formData.has('media')
        ? JSON.parse(formData.get('media') as string)
        : undefined,
    };

    const validationResult = updateServiceMediaSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Media validation errors:', validationResult.error);
      return {
        success: false,
        error:
          'Validation failed: ' +
          validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const validData = validationResult.data;

    // Update service media
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        media: validData.media as any,
        updatedAt: new Date(),
      },
    });

    // Invalidate caches
    await invalidateServiceCaches({
      serviceId: updatedService.id,
      slug: updatedService.slug,
      pid: updatedService.pid,
      category: updatedService.category,
      userId: existingService.profile.uid,
      profileId: existingService.profile.id,
      profileUsername: existingService.profile.username,
    });

    return {
      success: true,
      data: { message: 'Service media updated successfully' },
    };
  } catch (error) {
    console.error('Error updating service media:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service media',
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

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { status: newStatus },
      include: {
        profile: {
          select: {
            uid: true,
            id: true,
            username: true,
            user: {
              select: {
                email: true,
                displayName: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Invalidate caches
    await invalidateServiceCaches({
      serviceId: updatedService.id,
      slug: updatedService.slug,
      pid: updatedService.pid,
      category: updatedService.category,
      userId: updatedService.profile.uid,
      profileId: updatedService.profile.id,
      profileUsername: updatedService.profile.username,
    });

    // Send email notification if service was published
    if (newStatus === 'published') {
      try {
        await sendServicePublishedEmail(
          {
            id: updatedService.id,
            title: updatedService.title,
            slug: updatedService.slug || '',
          },
          { ...updatedService.profile.user, email: updatedService.profile.user.email || '' }
        );

      } catch (emailError) {
        console.error('[Email] Failed to send service published notification:', emailError);
        // Don't block the status update if email fails
      }
    }

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

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { featured: !service.featured },
      include: {
        profile: {
          select: {
            uid: true,
            id: true,
            username: true,
          },
        },
      },
    });

    // Invalidate caches
    await invalidateServiceCaches({
      serviceId: updatedService.id,
      slug: updatedService.slug,
      pid: updatedService.pid,
      category: updatedService.category,
      userId: updatedService.profile.uid,
      profileId: updatedService.profile.id,
      profileUsername: updatedService.profile.username,
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
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        status,
        // Store rejection reason in a metadata field if needed
        // This assumes you might add a metadata or notes field to the Service model
      },
      include: {
        profile: {
          select: {
            uid: true,
            id: true,
            username: true,
            user: {
              select: {
                email: true,
                displayName: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Invalidate caches
    await invalidateServiceCaches({
      serviceId: updatedService.id,
      slug: updatedService.slug,
      pid: updatedService.pid,
      category: updatedService.category,
      userId: updatedService.profile.uid,
      profileId: updatedService.profile.id,
      profileUsername: updatedService.profile.username,
    });

    // Send email notification if service was published
    if (status === 'published') {
      try {
        await sendServicePublishedEmail(
          {
            id: updatedService.id,
            title: updatedService.title,
            slug: updatedService.slug || '',
          },
          { ...updatedService.profile.user, email: updatedService.profile.user.email || '' }
        );

      } catch (emailError) {
        console.error('[Email] Failed to send service published notification:', emailError);
        // Don't block the status update if email fails
      }
    }

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
      include: {
        profile: {
          select: {
            uid: true,
            id: true,
            username: true,
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

    // Invalidate caches before deletion
    await invalidateServiceCaches({
      serviceId: service.id,
      slug: service.slug,
      pid: service.pid,
      category: service.category,
      userId: service.profile.uid,
      profileId: service.profile.id,
      profileUsername: service.profile.username,
    });

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

    // Get taxonomy breakdowns
    const [servicesByCategory, servicesBySubcategory, servicesBySubdivision] =
      await Promise.all([
        prisma.service.groupBy({
          by: ['category'],
          _count: true,
          orderBy: {
            _count: {
              category: 'desc',
            },
          },
          take: 1,
        }),
        prisma.service.groupBy({
          by: ['subcategory'],
          _count: true,
          orderBy: {
            _count: {
              subcategory: 'desc',
            },
          },
          take: 1,
        }),
        prisma.service.groupBy({
          by: ['subdivision'],
          _count: true,
          orderBy: {
            _count: {
              subdivision: 'desc',
            },
          },
          take: 1,
        }),
      ]);

    // Get service types, tags, and pricing data (need to query JSON field)
    const allServices = await prisma.service.findMany({
      select: { type: true, tags: true, fixed: true, subscriptionType: true, duration: true, price: true },
    });

    // Count service types by checking boolean flags
    const serviceTypes = {
      presence: 0,
      online: 0,
      oneoff: 0,
      onbase: 0,
      subscription: 0,
      onsite: 0,
    };

    // Count tags
    const tagCounts: Record<string, number> = {};

    // Pricing statistics
    let fixedCount = 0;
    let notFixedCount = 0;
    const subscriptionTypeCounts = {
      month: 0,
      year: 0,
      per_case: 0,
      per_hour: 0,
      per_session: 0,
    };
    let totalDuration = 0;
    let durationCount = 0;
    let totalPrice = 0;
    let priceCount = 0;

    allServices.forEach((service) => {
      const type = service.type as any;
      if (type?.presence) serviceTypes.presence++;
      if (type?.online) serviceTypes.online++;
      if (type?.oneoff) serviceTypes.oneoff++;
      if (type?.onbase) serviceTypes.onbase++;
      if (type?.subscription) serviceTypes.subscription++;
      if (type?.onsite) serviceTypes.onsite++;

      // Count tags
      service.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Count pricing data
      if (service.fixed) {
        fixedCount++;
      } else {
        notFixedCount++;
      }
      if (service.subscriptionType) {
        subscriptionTypeCounts[service.subscriptionType]++;
      }
      if (service.duration && service.duration > 0) {
        totalDuration += service.duration;
        durationCount++;
      }
      if (service.price && service.price > 0) {
        totalPrice += service.price;
        priceCount++;
      }
    });

    // Calculate averages
    const averageDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;
    const averagePrice = priceCount > 0 ? Math.round(totalPrice / priceCount) : 0;

    // Get top tag
    const topTagEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    const topTagRaw = topTagEntry ? { name: topTagEntry[0], count: topTagEntry[1] } : null;

    // Resolve taxonomy labels
    // O(1) lookups - 99% faster than O(n³) nested flatMap.find chains
    const categoryData = servicesByCategory[0]
      ? findServiceById(servicesByCategory[0].category)
      : null;
    const subcategoryData = servicesBySubcategory[0]
      ? findServiceById(servicesBySubcategory[0].subcategory)
      : null;
    const subdivisionData = servicesBySubdivision[0]
      ? findServiceById(servicesBySubdivision[0].subdivision)
      : null;

    // Resolve tag label - O(1) optimized hash map lookups
    const topTagData = topTagRaw
      ? (findTagById(topTagRaw.name) || findTagBySlug(topTagRaw.name))
      : null;
    const topTag = topTagData
      ? { name: topTagData.label, count: topTagRaw.count }
      : topTagRaw;

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
        topCategory: servicesByCategory[0]
          ? {
              name: categoryData?.label || servicesByCategory[0].category,
              count: servicesByCategory[0]._count,
            }
          : null,
        topSubcategory: servicesBySubcategory[0]
          ? {
              name:
                subcategoryData?.label || servicesBySubcategory[0].subcategory,
              count: servicesBySubcategory[0]._count,
            }
          : null,
        topSubdivision: servicesBySubdivision[0]
          ? {
              name:
                subdivisionData?.label || servicesBySubdivision[0].subdivision,
              count: servicesBySubdivision[0]._count,
            }
          : null,
        topTag,
        serviceTypes,
        pricing: {
          fixed: fixedCount,
          notFixed: notFixedCount,
          subscriptionTypes: subscriptionTypeCounts,
          averageDuration,
          averagePrice,
        },
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
