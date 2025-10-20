'use server';

import { prisma } from '@/lib/prisma/client';
import type { SavedState } from '@/lib/types/saved';

/**
 * Get user's saved state for checking if items are saved
 * Returns Sets of IDs for O(1) lookup performance
 * Used by home page and archive pages to show heart icon states
 */
export async function getUserSavedState(
  userId?: string
): Promise<SavedState> {
  // Return empty sets if no user ID provided
  if (!userId) {
    return {
      serviceIds: new Set<number>(),
      profileIds: new Set<string>(),
    };
  }

  try {
    // Fetch all saved IDs in parallel
    const [savedServices, savedProfiles] = await Promise.all([
      prisma.savedService.findMany({
        where: { userId },
        select: { serviceId: true },
      }),
      prisma.savedProfile.findMany({
        where: { userId },
        select: { profileId: true },
      }),
    ]);

    // Convert to Sets for O(1) lookup
    return {
      serviceIds: new Set(savedServices.map((s) => s.serviceId)),
      profileIds: new Set(savedProfiles.map((p) => p.profileId)),
    };
  } catch (error) {
    console.error('❌ Get saved state error:', error);
    // Return empty sets on error
    return {
      serviceIds: new Set<number>(),
      profileIds: new Set<string>(),
    };
  }
}
