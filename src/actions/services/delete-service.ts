'use server';

import { requireAuth } from '@/actions/auth/server';
import { getProfileByUserId } from '@/actions/profiles/get-profile';
import { prisma } from '@/lib/prisma/client';
import { ActionResult } from '@/lib/types/api';
import {
  deleteServiceSchema,
  type DeleteServiceInput,
} from '@/lib/validations/service';
import { revalidateService, logCacheRevalidation } from '@/lib/cache';
import { brevoWorkflowService } from '@/lib/email/providers/brevo/workflows';
import { z } from 'zod';

/**
 * Delete service - User-facing action
 * Only allows users to delete their own services
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function deleteService(
  input: DeleteServiceInput
): Promise<ActionResult<void>> {
  try {
    // 1. Validate input
    const validated = deleteServiceSchema.parse(input);
    const { serviceId } = validated;

    // 2. Get authenticated session
    const session = await requireAuth();
    const user = session.user;

    // 3. Check permissions - only freelancers and companies can manage services
    if (user.role !== 'freelancer' && user.role !== 'company') {
      return {
        success: false,
        error: 'Only professionals can manage services',
      };
    }

    // 4. Get user profile using cached function
    const profileResult = await getProfileByUserId(user.id);

    if (!profileResult.success || !profileResult.data) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    const profile = profileResult.data;

    // 5. Get service with ownership check
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        reviews: { select: { id: true } },
      },
    });

    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    // 6. Verify ownership
    if (service.pid !== profile.id) {
      return {
        success: false,
        error: 'Unauthorized: You can only delete your own services',
      };
    }

    // 7. Optional: Prevent deletion if service has reviews
    // Uncomment if you want to protect services with reviews
    // if (service.reviews.length > 0) {
    //   return {
    //     success: false,
    //     error:
    //       'Cannot delete service with existing reviews. Please contact support if you need to remove this service.',
    //   };
    // }

    // 8. Delete the service (cascade will handle reviews, savedBy, etc.)
    // Note: media is stored as JSON in the service table, not as a separate relation
    await prisma.service.delete({
      where: { id: serviceId },
    });

    // 9. Comprehensive cache invalidation using centralized utility
    await revalidateService({
      serviceId: service.id,
      slug: service.slug,
      pid: service.pid,
      category: service.category,
      userId: user.id,
      profileId: profile.id,
      profileUsername: profile.username,
      includeHome: service.featured, // Invalidate home if service was featured
    });

    // 10. Log cache revalidation for monitoring
    logCacheRevalidation('service', service.id, 'deleted');

    // 11. Sync Brevo list (may move PROS → NOSERVICES if last service)
    await brevoWorkflowService.handleUserStateChange(user.id);

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  } catch (error) {
    console.error('Delete service error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete service',
    };
  }
}

/**
 * Soft delete - mark as inactive instead of deleting
 * Alternative approach for preserving data
 */
export async function archiveService(
  input: DeleteServiceInput
): Promise<ActionResult<void>> {
  try {
    // 1. Validate input
    const validated = deleteServiceSchema.parse(input);
    const { serviceId } = validated;

    // 2. Get authenticated session
    const session = await requireAuth();
    const user = session.user;

    // 3. Get user profile
    const profileResult = await getProfileByUserId(user.id);

    if (!profileResult.success || !profileResult.data) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    const profile = profileResult.data;

    // 4. Get service and check ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    if (service.pid !== profile.id) {
      return {
        success: false,
        error: 'Unauthorized: You can only archive your own services',
      };
    }

    // 5. Archive service (mark as inactive)
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        status: 'inactive',
      },
    });

    // 6. Invalidate caches
    await revalidateService({
      serviceId: service.id,
      slug: service.slug,
      pid: service.pid,
      category: service.category,
      userId: user.id,
      profileId: profile.id,
      profileUsername: profile.username,
      includeHome: service.featured,
    });

    // 7. Log cache revalidation
    logCacheRevalidation('service', service.id, 'archived');

    // 8. Sync Brevo list (may move PROS → NOSERVICES if last published service)
    await brevoWorkflowService.handleUserStateChange(user.id);

    return {
      success: true,
      message: 'Service archived successfully',
    };
  } catch (error) {
    console.error('Archive service error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid parameters',
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      error: 'Failed to archive service',
    };
  }
}
