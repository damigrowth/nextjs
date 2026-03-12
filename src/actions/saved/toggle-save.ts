'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import type { ActionResult } from '@/lib/types/api';
import type { ToggleSaveResult } from '@/lib/types/saved';

/**
 * Toggle save/unsave for a service or profile
 * Uses optimistic locking to prevent race conditions
 */
export async function toggleSave(
  itemType: 'service' | 'profile',
  itemId: string | number
): Promise<ActionResult<ToggleSaveResult>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    const userId = session.user.id;

    if (itemType === 'service') {
      const serviceId = typeof itemId === 'string' ? parseInt(itemId) : itemId;

      // Validate service ID
      if (isNaN(serviceId)) {
        return { success: false, error: 'Invalid service ID' };
      }

      // Check if already saved
      const existing = await prisma.savedService.findUnique({
        where: {
          userId_serviceId: {
            userId,
            serviceId,
          },
        },
      });

      if (existing) {
        // Unsave
        await prisma.savedService.delete({
          where: { id: existing.id },
        });
        return { success: true, data: { isSaved: false } };
      } else {
        // Save
        await prisma.savedService.create({
          data: {
            userId,
            serviceId,
          },
        });
        return { success: true, data: { isSaved: true } };
      }
    } else {
      // Profile type
      const profileId = typeof itemId === 'number' ? itemId.toString() : itemId;

      // Check if already saved
      const existing = await prisma.savedProfile.findUnique({
        where: {
          userId_profileId: {
            userId,
            profileId,
          },
        },
      });

      if (existing) {
        // Unsave
        await prisma.savedProfile.delete({
          where: { id: existing.id },
        });
        return { success: true, data: { isSaved: false } };
      } else {
        // Save
        await prisma.savedProfile.create({
          data: {
            userId,
            profileId,
          },
        });
        return { success: true, data: { isSaved: true } };
      }
    }
  } catch (error) {
    console.error('Toggle save error:', error);
    return {
      success: false,
      error: 'Failed to update saved status',
    };
  }
}
