import { NextRequest, NextResponse } from 'next/server';
import { getStripeForWebhook } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma/client';
import { revalidateProfile, logCacheRevalidation, CACHE_TAGS } from '@/lib/cache';
import { revalidateTag } from 'next/cache';
import type Stripe from 'stripe';
import {
  getSubscriptionPeriod,
  mapStripeStatus,
  getInvoiceSubscriptionId,
} from '@/lib/types/stripe';
import { getStripeWebhookSecret } from '@/lib/payment/stripe-config';

// Lazy initialization to avoid build-time errors
let _stripe: ReturnType<typeof getStripeForWebhook> | null = null;
function getStripe() {
  if (!_stripe) {
    _stripe = getStripeForWebhook();
  }
  return _stripe;
}

function getWebhookSecret() {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    console.error('Stripe webhook secret is not configured');
  }
  return secret;
}

/**
 * Handle Stripe webhook events for subscription lifecycle.
 * Events handled:
 * - checkout.session.completed → Activate subscription
 * - customer.subscription.updated → Sync status changes
 * - customer.subscription.deleted → Deactivate subscription
 * - invoice.payment_failed → Mark as past_due
 */
export async function POST(request: NextRequest) {
  const webhookSecret = getWebhookSecret();

  // Runtime check for webhook secret
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Log all incoming webhook events
  console.log('[Stripe Webhook] Event received:', {
    type: event.type,
    id: event.id,
    created: new Date(event.created * 1000).toISOString(),
  });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const profileId = session.metadata?.profileId;
  if (!profileId || !session.subscription) return;

  // Retrieve subscription from Stripe
  const stripe = getStripe();
  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string,
  );

  // Get subscription period using type-safe utility
  const period = getSubscriptionPeriod(stripeSubscription);

  // Get profile data needed for cache revalidation and billing snapshot
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { uid: true, username: true, category: true, billing: true },
  });

  // Debug logging for billing snapshot
  console.log('[Stripe Webhook] Profile billing snapshot:', {
    profileId,
    hasBilling: !!profile?.billing,
    billing: profile?.billing,
  });

  // Get subscription price details for analytics
  const priceItem = stripeSubscription.items.data[0]?.price;
  const amount = priceItem?.unit_amount || null;
  const currency = priceItem?.currency || 'eur';

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { pid: profileId },
      data: {
        // Provider-agnostic fields (new)
        provider: 'stripe',
        providerCustomerId: session.customer as string,
        providerSubscriptionId: stripeSubscription.id,
        // Legacy Stripe fields (backward compatibility)
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceItem?.id,
        // Subscription data
        plan: 'promoted',
        status: 'active',
        billingInterval:
          priceItem?.recurring?.interval === 'year' ? 'year' : 'month',
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        // Reset cancellation fields for new subscription
        cancelAtPeriodEnd: false,
        canceledAt: null,
        // Snapshot of billing details from profile at time of checkout
        billing: profile?.billing ?? null,
        // Analytics: set initial amount (cumulative tracking handled by invoice.paid)
        amount,
        currency,
      },
    });

    await tx.profile.update({
      where: { id: profileId },
      data: { featured: true },
    });
  });

  // Use existing revalidation helpers
  if (profile) {
    await revalidateProfile({
      profileId,
      userId: profile.uid,
      username: profile.username,
      category: profile.category,
      includeHome: true, // Featured profiles show on home
      includeServices: true,
    });
    logCacheRevalidation('profile', profileId, 'subscription activated');
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const dbSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSub) return;

  const isActive = subscription.status === 'active';
  // Get subscription period using type-safe utility
  const period = getSubscriptionPeriod(subscription);
  const mappedStatus = mapStripeStatus(subscription.status);

  const profile = await prisma.profile.findUnique({
    where: { id: dbSub.pid },
    select: { uid: true, username: true, category: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        // Ensure provider fields are set
        provider: 'stripe',
        providerSubscriptionId: subscription.id,
        // Subscription status and data
        status: mappedStatus,
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        cancelAtPeriodEnd: period.cancelAtPeriodEnd,
        canceledAt: period.cancelAtPeriodEnd ? new Date() : null,
        // Legacy Stripe fields
        stripePriceId: subscription.items.data[0]?.price.id,
        billingInterval:
          subscription.items.data[0]?.price.recurring?.interval === 'year'
            ? 'year'
            : 'month',
      },
    });

    await tx.profile.update({
      where: { id: dbSub.pid },
      data: { featured: isActive },
    });
  });

  if (profile) {
    await revalidateProfile({
      profileId: dbSub.pid,
      userId: profile.uid,
      username: profile.username,
      category: profile.category,
      includeHome: true,
      includeServices: true,
    });
    logCacheRevalidation('profile', dbSub.pid, 'subscription updated');
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!dbSub) return;

  const profile = await prisma.profile.findUnique({
    where: { id: dbSub.pid },
    select: { uid: true, username: true, category: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled',
        plan: 'free',
        canceledAt: new Date(),
      },
    });

    await tx.profile.update({
      where: { id: dbSub.pid },
      data: { featured: false },
    });

    // Remove featured flag from all profile services
    await tx.service.updateMany({
      where: { pid: dbSub.pid, featured: true },
      data: { featured: false },
    });
  });

  if (profile) {
    await revalidateProfile({
      profileId: dbSub.pid,
      userId: profile.uid,
      username: profile.username,
      category: profile.category,
      includeHome: true,
      includeServices: true,
    });
    logCacheRevalidation('profile', dbSub.pid, 'subscription deleted');
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Get subscription ID using type-safe utility
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'past_due' },
  });
}

/**
 * Handle successful invoice payment - tracks cumulative payment analytics.
 * This fires on every successful payment (initial + renewals).
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  console.log('[Stripe Webhook] invoice.paid received:', {
    invoiceId: invoice.id,
    subscriptionId,
    customerId,
    amountPaid: invoice.amount_paid,
  });

  let dbSub = null;

  // Try to find subscription by stripeSubscriptionId first (if available)
  if (subscriptionId) {
    dbSub = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true, totalPaidLifetime: true, paymentCount: true, firstPaymentAt: true },
    });
  }

  // Fallback: If not found by subscription ID (or subscription ID not in invoice),
  // try to find by customer ID
  if (!dbSub && customerId) {
    console.log('[Stripe Webhook] invoice.paid: Trying lookup by customerId:', customerId);

    dbSub = await prisma.subscription.findUnique({
      where: { stripeCustomerId: customerId },
      select: { id: true, totalPaidLifetime: true, paymentCount: true, firstPaymentAt: true },
    });

    // If found by customer ID and we have a subscriptionId, also update the stripeSubscriptionId
    if (dbSub && subscriptionId) {
      await prisma.subscription.update({
        where: { id: dbSub.id },
        data: { stripeSubscriptionId: subscriptionId, providerSubscriptionId: subscriptionId },
      });
      console.log('[Stripe Webhook] invoice.paid: Updated subscription with stripeSubscriptionId');
    }
  }

  if (!dbSub) {
    console.log('[Stripe Webhook] invoice.paid: No subscription found for', { subscriptionId, customerId });
    return;
  }

  // Amount paid in cents
  const amountPaid = invoice.amount_paid || 0;
  const currency = invoice.currency || 'eur';

  // Extract payment method details from the charge
  let paymentMethodType: string | null = null;
  let paymentMethodLast4: string | null = null;
  let paymentMethodBrand: string | null = null;

  if (invoice.charge) {
    try {
      const stripe = getStripe();
      const charge = await stripe.charges.retrieve(invoice.charge as string);

      if (charge.payment_method_details) {
        const pmDetails = charge.payment_method_details;
        paymentMethodType = pmDetails.type || null;

        if (pmDetails.card) {
          paymentMethodLast4 = pmDetails.card.last4 || null;
          paymentMethodBrand = pmDetails.card.brand || null;
        } else if (pmDetails.sepa_debit) {
          paymentMethodLast4 = pmDetails.sepa_debit.last4 || null;
          paymentMethodBrand = 'sepa';
        }
      }
    } catch (error) {
      console.error('[Stripe Webhook] Failed to retrieve charge details:', error);
    }
  }

  // Extract discount info if present
  let discountCode: string | null = null;
  let discountPercentOff: number | null = null;
  let discountAmountOff: number | null = null;

  if (invoice.discount?.coupon) {
    discountCode = invoice.discount.coupon.id || null;
    discountPercentOff = invoice.discount.coupon.percent_off || null;
    discountAmountOff = invoice.discount.coupon.amount_off || null;
  }

  // Update analytics - increment cumulative totals
  await prisma.subscription.update({
    where: { id: dbSub.id },
    data: {
      // Current payment details
      amount: amountPaid,
      currency: currency,
      paymentMethodType,
      paymentMethodLast4,
      paymentMethodBrand,

      // Cumulative totals - increment on each payment
      totalPaidLifetime: dbSub.totalPaidLifetime + amountPaid,
      paymentCount: dbSub.paymentCount + 1,

      // Payment timestamps
      firstPaymentAt: dbSub.firstPaymentAt || new Date(),
      lastPaymentAt: new Date(),

      // Discount tracking
      discountCode,
      discountPercentOff,
      discountAmountOff,
    },
  });

  console.log('[Stripe Webhook] Payment analytics updated:', {
    subscriptionId: dbSub.id,
    amountPaid,
    currency,
    newTotalPaidLifetime: dbSub.totalPaidLifetime + amountPaid,
    newPaymentCount: dbSub.paymentCount + 1,
    paymentMethodType,
    paymentMethodBrand,
  });
}
