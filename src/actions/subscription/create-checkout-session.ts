'use server';

import { prisma } from '@/lib/prisma/client';
import { stripe } from '@/lib/stripe/client';
import { PRICING } from '@/lib/stripe/config';
import { createCheckoutSessionSchema } from '@/lib/validations/subscription';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import type { ActionResult } from '@/lib/types/api';

/**
 * Create a Stripe Checkout Session for subscription.
 * Creates a Stripe customer if one doesn't exist.
 * Returns the checkout session URL to redirect to.
 */
export async function createCheckoutSession(
  input: { priceId: string; billingInterval: 'month' | 'year' },
): Promise<ActionResult<{ url: string }>> {
  try {
    const session = await requireAuth();
    const user = session.user;

    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return { success: false, error: 'Απαιτείται επαγγελματικό προφίλ' };
    }

    // Validate input
    const parsed = createCheckoutSessionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Μη έγκυρα δεδομένα' };
    }

    const { priceId, billingInterval } = parsed.data;

    // Verify priceId matches our configured prices
    const validPriceIds = [PRICING.monthly.stripePriceId, PRICING.annual.stripePriceId];
    if (!validPriceIds.includes(priceId)) {
      return { success: false, error: 'Μη έγκυρο πακέτο τιμής' };
    }

    const profile = await prisma.profile.findUnique({
      where: { uid: user.id },
      select: { id: true, email: true, displayName: true },
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

    // Get or create Stripe customer
    let stripeCustomerId = existingSub?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        name: profile.displayName || undefined,
        metadata: {
          profileId: profile.id,
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Upsert subscription record with Stripe customer ID
      await prisma.subscription.upsert({
        where: { pid: profile.id },
        create: {
          pid: profile.id,
          stripeCustomerId: customer.id,
          plan: 'free',
          status: 'incomplete',
        },
        update: {
          stripeCustomerId: customer.id,
        },
      });
    }

    // Create Stripe Checkout Session
    // Reuse BETTER_AUTH_URL as the app's base URL (same pattern as auth config)
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/checkout`,
      metadata: {
        profileId: profile.id,
        billingInterval,
      },
    });

    if (!checkoutSession.url) {
      return { success: false, error: 'Αποτυχία δημιουργίας συνεδρίας πληρωμής' };
    }

    return { success: true, data: { url: checkoutSession.url } };
  } catch (error: any) {
    return handleBetterAuthError(error);
  }
}
