/**
 * Stripe SDK v20+ Type Extensions
 *
 * The Stripe SDK v20+ changed how some properties are typed.
 * These types provide proper typing for webhook event handling.
 */

import type Stripe from 'stripe';

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
  return {
    start: new Date(sub.current_period_start * 1000),
    end: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
  };
}

/**
 * Map Stripe subscription status to our database status
 */
export function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid' {
  const statusMap: Record<string, 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid'> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete',
    trialing: 'trialing',
    unpaid: 'unpaid',
    paused: 'active', // Treat paused as active for our purposes
  };
  return statusMap[status] || 'incomplete';
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
