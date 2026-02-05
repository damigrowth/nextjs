'use server';

import { prisma } from '@/lib/prisma/client';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { revalidateService, logCacheRevalidation } from '@/lib/cache';
import { canFeatureService } from '@/lib/subscription/feature-gate';
import type { ActionResult } from '@/lib/types/api';

/**
 * Toggle the featured status of a service.
 * Only available to promoted subscribers.
 * Limited to maxFeaturedServices (5 for promoted plan).
 */
export async function toggleFeaturedService(
  serviceId: number,
): Promise<ActionResult<{ featured: boolean }>> {
  try {
    const session = await requireAuth();
    const user = session.user;

    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return { success: false, error: 'Απαιτείται επαγγελματικό προφίλ' };
    }

    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: { id: true, username: true, category: true, featured: true },
    });

    if (!profile) {
      return { success: false, error: 'Το προφίλ δεν βρέθηκε' };
    }

    // Verify service ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, pid: true, slug: true, featured: true, status: true, category: true },
    });

    if (!service || service.pid !== profile.id) {
      return { success: false, error: 'Η υπηρεσία δεν βρέθηκε' };
    }

    if (service.status !== 'published') {
      return { success: false, error: 'Μόνο δημοσιευμένες υπηρεσίες μπορούν να προβληθούν' };
    }

    // If currently featured, allow unfeaturing
    if (service.featured) {
      await prisma.service.update({
        where: { id: serviceId },
        data: { featured: false },
      });
    } else {
      // If not featured, check if can feature more
      const canFeature = await canFeatureService(profile.id);
      if (!canFeature) {
        return {
          success: false,
          error: 'Έχετε φτάσει το μέγιστο αριθμό προβεβλημένων υπηρεσιών',
        };
      }

      await prisma.service.update({
        where: { id: serviceId },
        data: { featured: true },
      });
    }

    // Use existing revalidation helper (same as refresh-service pattern)
    await revalidateService({
      serviceId: service.id,
      slug: service.slug,
      pid: service.pid,
      category: service.category,
      userId: user.id,
      profileId: profile.id,
      profileUsername: profile.username,
      includeHome: true,
    });

    logCacheRevalidation('service', service.id, 'featured toggle');

    return { success: true, data: { featured: !service.featured } };
  } catch (error: unknown) {
    return handleBetterAuthError(error);
  }
}
