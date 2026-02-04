'use server';

import { prisma } from '@/lib/prisma/client';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import type { ActionResult } from '@/lib/types/api';
import type { Subscription } from '@prisma/client';

/**
 * Get the current user's subscription status.
 * Returns null subscription data if user has no subscription (free plan).
 */
export async function getSubscription(): Promise<
  ActionResult<{ subscription: Subscription | null }>
> {
  try {
    const session = await requireAuth();
    const user = session.user;

    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return { success: false, error: 'Απαιτείται επαγγελματικό προφίλ' };
    }

    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: 'Το προφίλ δεν βρέθηκε' };
    }

    const subscription = await prisma.subscription.findUnique({
      where: { pid: profile.id },
    });

    return { success: true, data: { subscription } };
  } catch (error: any) {
    return handleBetterAuthError(error);
  }
}
