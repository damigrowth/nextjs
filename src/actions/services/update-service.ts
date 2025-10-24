'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_TAGS, getServiceTags } from '@/lib/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import type { ActionResult } from '@/lib/types/api';
import {
  updateServiceMediaSchema,
  updateServiceInfoSchema,
  type UpdateServiceMediaInput,
  type UpdateServiceInfoInput,
} from '@/lib/validations/service';
import { normalizeTerm } from '@/lib/utils/text/normalize';

// =============================================
// SHARED UTILITIES
// =============================================

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
    pid,
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

  // Revalidate specific pages
  if (slug) {
    revalidatePath(`/s/${slug}`);
  }
  if (profileUsername) {
    revalidatePath(`/profile/${profileUsername}`);
  }
}

// =============================================
// UPDATE SERVICE MEDIA
// =============================================

export async function updateServiceMedia(
  serviceId: number,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Check if service exists and belongs to user
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return { success: false, error: 'Service not found' };
    }

    if (existingService.pid !== profile.id) {
      return { success: false, error: 'Unauthorized access' };
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
      include: {
        profile: {
          select: {
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
      userId: session.user.id,
      profileId: profile.id,
      profileUsername: updatedService.profile?.username || null,
    });

    return {
      success: true,
      data: { message: 'Τα πολυμέσα ενημερώθηκαν επιτυχώς!' },
    };
  } catch (error) {
    console.error('Update service media error:', error);
    return {
      success: false,
      error: 'Failed to update service media',
    };
  }
}

// =============================================
// UPDATE SERVICE INFO
// =============================================

export async function updateServiceInfo(
  serviceId: number,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Check if service exists and belongs to user
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return { success: false, error: 'Service not found' };
    }

    if (existingService.pid !== profile.id) {
      return { success: false, error: 'Unauthorized access' };
    }

    // Parse FormData - only include fields that are present
    const rawData: Partial<UpdateServiceInfoInput> = {};

    // Parse all FormData entries
    for (const [key, value] of formData.entries()) {
      switch (key) {
        // Basic string fields
        case 'title':
        case 'description':
        case 'category':
        case 'subcategory':
        case 'subdivision':
          rawData[key] = value as string;
          break;

        // Number fields
        case 'price':
        case 'duration':
          rawData[key] = Number(value) || 0;
          break;

        // Boolean field
        case 'fixed':
          rawData.fixed = value === 'true';
          break;

        // Optional string field (with type assertion)
        case 'subscriptionType':
          rawData.subscriptionType = value as any;
          break;

        // JSON fields
        case 'type':
        case 'tags':
        case 'addons':
        case 'faq':
          rawData[key] = JSON.parse(value as string);
          break;
      }
    }

    // Validate data
    const validationResult = updateServiceInfoSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('Service info validation errors:', validationResult.error);
      return {
        success: false,
        error:
          'Validation failed: ' +
          validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const validData = validationResult.data;

    // Build update data object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Add each field if present in validated data
    for (const [key, value] of Object.entries(validData)) {
      switch (key) {
        case 'title':
          updateData.title = value;
          updateData.titleNormalized = normalizeTerm(value as string);
          break;

        case 'description':
          updateData.description = value;
          updateData.descriptionNormalized = normalizeTerm(value as string);
          break;

        case 'category':
        case 'subcategory':
        case 'subdivision':
        case 'tags':
        case 'price':
        case 'fixed':
        case 'type':
        case 'duration':
        case 'addons':
        case 'faq':
          updateData[key] = value;
          break;

        case 'subscriptionType':
          updateData.subscriptionType = value || null;
          break;
      }
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        profile: {
          select: {
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
      userId: session.user.id,
      profileId: profile.id,
      profileUsername: updatedService.profile?.username || null,
    });

    return {
      success: true,
      data: { message: 'Η υπηρεσία ενημερώθηκε επιτυχώς!' },
    };
  } catch (error) {
    console.error('Update service info error:', error);
    return {
      success: false,
      error: 'Failed to update service info',
    };
  }
}

// =============================================
// LEGACY EXPORT (for backward compatibility)
// =============================================

/**
 * @deprecated Use updateServiceInfo() or updateServiceMedia() instead
 */
export const updateServiceAction = updateServiceInfo;
