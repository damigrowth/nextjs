'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/lib/types/api';

/**
 * Refresh a service to boost it to the top of listings
 * Rate limiting rules:
 * 1. Each service can only be refreshed once every 24 hours
 * 2. Maximum 10 unique services can be refreshed per day (resets at midnight)
 */
export async function refreshService(
  serviceId: number,
): Promise<
  ActionResult<{
    refreshedAt: Date;
    remainingRefreshes: number;
  }>
> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Απαιτείται σύνδεση' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
      select: {
        id: true,
        lastServiceRefreshDate: true,
        dailyServiceRefreshCount: true,
      },
    });

    if (!profile) {
      return { success: false, error: 'Το προφίλ δεν βρέθηκε' };
    }

    // Get the service and verify ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        pid: true,
        refreshedAt: true,
      },
    });

    if (!service) {
      return { success: false, error: 'Η υπηρεσία δεν βρέθηκε' };
    }

    // Verify ownership
    if (service.pid !== profile.id) {
      return {
        success: false,
        error: 'Δεν έχετε δικαίωμα να ανανεώσετε αυτή την υπηρεσία',
      };
    }

    // Check if service was refreshed within the last 24 hours
    if (service.refreshedAt) {
      const hoursSinceLastRefresh =
        (Date.now() - service.refreshedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastRefresh < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastRefresh);
        return {
          success: false,
          error: `Η υπηρεσία μπορεί να ανανεωθεί μόνο μία φορά κάθε 24 ώρες. Διαθέσιμο σε ${hoursRemaining} ${hoursRemaining === 1 ? 'ώρα' : 'ώρες'}`,
        };
      }
    }

    // Check and reset daily counter if it's a new day
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let currentDailyCount = profile.dailyServiceRefreshCount;
    let lastRefreshDate = profile.lastServiceRefreshDate;

    // Reset counter if last refresh was on a different day
    if (!lastRefreshDate || lastRefreshDate < today) {
      currentDailyCount = 0;
      lastRefreshDate = null;
    }

    // Check daily limit (10 unique services per day)
    if (currentDailyCount >= 10) {
      return {
        success: false,
        error:
          'Έχετε φτάσει το ημερήσιο όριο των 10 ανανεώσεων υπηρεσιών. Δοκιμάστε ξανά αύριο.',
      };
    }

    // Perform the refresh - update both service and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update service refreshedAt and sortDate timestamps (moves to top of listings)
      const updatedService = await tx.service.update({
        where: { id: serviceId },
        data: {
          refreshedAt: now,
          sortDate: now,
        },
        select: {
          refreshedAt: true,
          sortDate: true,
        },
      });

      // Update profile refresh counter
      await tx.profile.update({
        where: { id: profile.id },
        data: {
          dailyServiceRefreshCount: currentDailyCount + 1,
          lastServiceRefreshDate: now,
        },
      });

      return updatedService;
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard/services');
    revalidatePath(`/s/${service.id}`);

    return {
      success: true,
      data: {
        refreshedAt: result.refreshedAt,
        remainingRefreshes: 10 - (currentDailyCount + 1),
      },
    };
  } catch (error) {
    console.error('Refresh service error:', error);
    return {
      success: false,
      error: 'Αποτυχία ανανέωσης υπηρεσίας. Δοκιμάστε ξανά.',
    };
  }
}
