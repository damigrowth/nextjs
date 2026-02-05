'use server';

import { prisma } from '@/lib/prisma/client';
import { PaymentService } from '@/lib/payment';
import { ProviderNotConfiguredError, ProviderOperationError } from '@/lib/payment';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import type { ActionResult } from '@/lib/types/api';

/**
 * Restore a subscription that was scheduled for cancellation (provider-agnostic).
 * Uses PaymentService facade which delegates to the configured payment provider.
 * Only works if the subscription has cancelAtPeriodEnd = true and hasn't expired yet.
 */
export async function restoreSubscription(): Promise<ActionResult<{ restored: boolean }>> {
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

    // Use PaymentService to restore subscription (provider-agnostic)
    // PaymentService.restoreSubscription handles provider lookup and database update
    await PaymentService.restoreSubscription(profile.id);

    // Revalidate using existing centralized helper
    await revalidateProfile({
      profileId: profile.id,
      userId: user.id,
      username: profile.username,
      category: profile.category,
      includeHome: profile.featured,
      includeServices: true,
    });

    logCacheRevalidation('profile', profile.id, 'subscription restoration');

    return { success: true, data: { restored: true } };
  } catch (error: unknown) {
    // Handle payment provider specific errors
    if (error instanceof ProviderNotConfiguredError) {
      return { success: false, error: 'Ο πάροχος πληρωμών δεν έχει ρυθμιστεί' };
    }
    if (error instanceof ProviderOperationError) {
      console.error('Payment provider error:', error);
      return { success: false, error: 'Αποτυχία επαναφοράς συνδρομής' };
    }
    // Handle specific error messages from PaymentService
    if (error instanceof Error) {
      if (error.message === 'No subscription found') {
        return { success: false, error: 'Δεν βρέθηκε συνδρομή' };
      }
      if (error.message === 'Subscription is not scheduled for cancellation') {
        return { success: false, error: 'Η συνδρομή δεν είναι προγραμματισμένη για ακύρωση' };
      }
    }
    return handleBetterAuthError(error);
  }
}
