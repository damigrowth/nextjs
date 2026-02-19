'use server';

import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/actions/auth/server';
import type { ActionResult } from '@/lib/types/api';

/**
 * Sync billing data from profile to subscription.
 * Called as a fallback when webhook might not have fired (e.g., local development).
 */
export async function syncSubscriptionBilling(): Promise<ActionResult<{ synced: boolean }>> {
  try {
    const session = await requireAuth();
    const user = session.user;

    // Get profile with billing data
    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: { id: true, billing: true },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { pid: profile.id },
      select: { id: true, billing: true, status: true },
    });

    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    // Only sync if subscription exists and billing is null but profile has billing
    if (subscription.billing === null && profile.billing !== null) {
      await prisma.subscription.update({
        where: { pid: profile.id },
        data: { billing: profile.billing },
      });

      // Verify the update actually persisted
      const verifyUpdate = await prisma.subscription.findUnique({
        where: { pid: profile.id },
        select: { id: true, billing: true },
      });

      const inputJson = JSON.stringify(profile.billing);
      const savedJson = JSON.stringify(verifyUpdate?.billing);
      const success = inputJson === savedJson;

      if (!success) {
        console.error('[SyncBilling] UPDATE FAILED - billing was not saved correctly!');
        return { success: false, error: 'Failed to persist billing data' };
      }

      return { success: true, data: { synced: true } };
    }

    return { success: true, data: { synced: false } };
  } catch (error) {
    console.error('[SyncBilling] Error:', error);
    return { success: false, error: 'Failed to sync billing' };
  }
}
