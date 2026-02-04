'use server';

import { prisma } from '@/lib/prisma/client';
import { stripe } from '@/lib/stripe/client';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import type { ActionResult } from '@/lib/types/api';

/**
 * Cancel the current user's subscription.
 * By default, cancels at end of current billing period.
 */
export async function cancelSubscription(
  cancelAtPeriodEnd: boolean = true,
): Promise<ActionResult<{ canceledAt: Date | null }>> {
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

    const subscription = await prisma.subscription.findUnique({
      where: { pid: profile.id },
    });

    if (!subscription?.stripeSubscriptionId) {
      return { success: false, error: 'Δεν βρέθηκε ενεργή συνδρομή' };
    }

    if (subscription.status !== 'active') {
      return { success: false, error: 'Η συνδρομή δεν είναι ενεργή' };
    }

    // Cancel via Stripe
    await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: cancelAtPeriodEnd },
    );

    // Update local record
    await prisma.subscription.update({
      where: { pid: profile.id },
      data: {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? new Date() : null,
      },
    });

    // Revalidate using existing centralized helper
    await revalidateProfile({
      profileId: profile.id,
      userId: user.id,
      username: profile.username,
      category: profile.category,
      includeHome: profile.featured,
      includeServices: true,
    });

    logCacheRevalidation('profile', profile.id, 'subscription cancellation');

    return {
      success: true,
      data: { canceledAt: cancelAtPeriodEnd ? new Date() : null },
    };
  } catch (error: any) {
    return handleBetterAuthError(error);
  }
}
