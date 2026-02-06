'use server';

import { prisma } from '@/lib/prisma/client';
import { PaymentService } from '@/lib/payment';
import { createCheckoutSessionSchema } from '@/lib/validations/subscription';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { ProviderNotConfiguredError, ProviderOperationError } from '@/lib/payment';
import type { ActionResult } from '@/lib/types/api';

/**
 * Create a Checkout Session for subscription (provider-agnostic).
 * Uses PaymentService facade which delegates to the configured payment provider.
 * Returns the checkout session URL to redirect to.
 */
export async function createCheckoutSession(
  input: { billingInterval: 'month' | 'year' },
): Promise<ActionResult<{ url: string }>> {
  try {
    const session = await requireAuth();
    const user = session.user;

    const roleCheck = await hasAnyRole(['freelancer', 'company', 'admin']);
    if (!roleCheck.success || !roleCheck.data) {
      return { success: false, error: 'Απαιτείται επαγγελματικό προφίλ' };
    }

    // Validate input
    const parsed = createCheckoutSessionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Μη έγκυρα δεδομένα' };
    }

    const { plan, billingInterval } = parsed.data;

    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: 'Το προφίλ δεν βρέθηκε' };
    }

    // Check if already subscribed
    const existingSub = await prisma.subscription.findUnique({
      where: { pid: profile.id },
    });

    if (existingSub?.status === 'active') {
      return { success: false, error: 'Έχετε ήδη ενεργή συνδρομή' };
    }

    // Use PaymentService to create checkout (provider-agnostic)
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

    const checkout = await PaymentService.createCheckout({
      profileId: profile.id,
      plan,
      billingInterval,
      successUrl: `${baseUrl}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard/checkout`,
    });

    return { success: true, data: { url: checkout.url } };
  } catch (error: unknown) {
    // Handle payment provider specific errors
    if (error instanceof ProviderNotConfiguredError) {
      return { success: false, error: 'Ο πάροχος πληρωμών δεν έχει ρυθμιστεί' };
    }
    if (error instanceof ProviderOperationError) {
      console.error('Payment provider error:', error);
      return { success: false, error: 'Αποτυχία δημιουργίας συνεδρίας πληρωμής' };
    }
    return handleBetterAuthError(error);
  }
}
