import { NextRequest, NextResponse } from 'next/server';
import { getStripeForWebhook } from '@/lib/stripe/client';
import { prisma } from '@/lib/prisma/client';
import { revalidateProfile, logCacheRevalidation, CACHE_TAGS } from '@/lib/cache';
import { revalidateTag } from 'next/cache';
import type Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Get Stripe client for webhook processing
const stripe = getStripeForWebhook();

/**
 * Handle Stripe webhook events for subscription lifecycle.
 * Events handled:
 * - checkout.session.completed → Activate subscription
 * - customer.subscription.updated → Sync status changes
 * - customer.subscription.deleted → Deactivate subscription
 * - invoice.payment_failed → Mark as past_due
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

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

  // Retrieve subscription from Stripe (cast to correct type for SDK v20+)
  const stripeSubscription = (await stripe.subscriptions.retrieve(
    session.subscription as string,
  )) as unknown as Stripe.Subscription;
  // Type assertion for Stripe SDK v20+ compatibility
  const sub = stripeSubscription as any;

  // Get profile data needed for cache revalidation
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { uid: true, username: true, category: true },
  });

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
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        // Subscription data
        plan: 'promoted',
        status: 'active',
        billingInterval:
          stripeSubscription.items.data[0]?.price.recurring?.interval === 'year'
            ? 'year'
            : 'month',
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
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
  // Type assertion for Stripe SDK v20+ compatibility
  const sub = subscription as any;

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
        status: subscription.status as any,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.cancel_at_period_end ? new Date() : null,
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
  // Type assertion for Stripe SDK v20+ compatibility
  const inv = invoice as any;
  if (!inv.subscription) return;

  const subscriptionId =
    typeof inv.subscription === 'string'
      ? inv.subscription
      : inv.subscription.id;

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'past_due' },
  });
}
