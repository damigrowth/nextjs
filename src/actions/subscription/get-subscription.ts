'use server';

import { prisma } from '@/lib/prisma/client';
import { PaymentService } from '@/lib/payment';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import type { ActionResult } from '@/lib/types/api';
import type { Subscription } from '@prisma/client';

/**
 * Get the current user's subscription status (provider-agnostic).
 * Uses PaymentService facade which queries YOUR database (source of truth).
 * Returns null subscription data if user has no subscription (free plan).
 */
export async function getSubscription(): Promise<
  ActionResult<{ subscription: Subscription | null }>
> {
  try {
    const session = await requireAuth();
    const user = session.user;

    const roleCheck = await hasAnyRole(['freelancer', 'company', 'admin']);
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

    // Use PaymentService to get subscription (reads from YOUR database)
    const subscription = await PaymentService.getSubscription(profile.id);

    return { success: true, data: { subscription } };
  } catch (error: unknown) {
    return handleBetterAuthError(error);
  }
}
