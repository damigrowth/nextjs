/**
 * Stripe SDK v20+ Type Extensions
 *
 * The Stripe SDK v20+ changed how some properties are typed.
 * These types provide proper typing for webhook event handling.
 */

import type Stripe from 'stripe';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Extended Subscription type with properties that exist at runtime
 * but are typed differently in SDK v20+
 */
export interface StripeSubscriptionWithPeriods extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

/**
 * Extended Invoice type with subscription property
 */
export interface StripeInvoiceWithSubscription extends Stripe.Invoice {
  subscription: string | Stripe.Subscription | null;
}

/**
 * Type guard to check if subscription has period fields
 */
export function hasSubscriptionPeriods(
  subscription: Stripe.Subscription
): subscription is StripeSubscriptionWithPeriods {
  return (
    'current_period_start' in subscription &&
    'current_period_end' in subscription &&
    typeof (subscription as StripeSubscriptionWithPeriods).current_period_start === 'number'
  );
}

/**
 * Safely get subscription period timestamps
 */
export function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  start: Date;
  end: Date;
  cancelAtPeriodEnd: boolean;
} {
  // Access properties directly - they exist at runtime
  const sub = subscription as unknown as StripeSubscriptionWithPeriods;

  // Validate timestamps exist and are numbers
  const startTimestamp = sub.current_period_start;
  const endTimestamp = sub.current_period_end;

  // Fallback to current time if timestamps are missing
  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    start: typeof startTimestamp === 'number' && startTimestamp > 0
      ? new Date(startTimestamp * 1000)
      : now,
    end: typeof endTimestamp === 'number' && endTimestamp > 0
      ? new Date(endTimestamp * 1000)
      : oneMonthLater,
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
  };
}

/**
 * Map Stripe subscription status to our database status
 */
export function mapStripeStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.active,
    past_due: SubscriptionStatus.past_due,
    canceled: SubscriptionStatus.canceled,
    incomplete: SubscriptionStatus.incomplete,
    incomplete_expired: SubscriptionStatus.incomplete,
    trialing: SubscriptionStatus.trialing,
    unpaid: SubscriptionStatus.unpaid,
    paused: SubscriptionStatus.active, // Treat paused as active for our purposes
  };
  return statusMap[status] || SubscriptionStatus.incomplete;
}

/**
 * Get subscription ID from invoice
 */
export function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const inv = invoice as unknown as StripeInvoiceWithSubscription;
  if (!inv.subscription) return null;
  return typeof inv.subscription === 'string'
    ? inv.subscription
    : inv.subscription.id;
}
