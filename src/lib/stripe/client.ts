/**
 * @deprecated Use PaymentService from @/lib/payment for provider-agnostic operations.
 * This client is maintained for backward compatibility with the Stripe webhook route.
 * Direct Stripe SDK usage should be avoided in favor of the payment abstraction layer.
 */
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Get Stripe client instance (lazy initialization)
 * Returns null if STRIPE_SECRET_KEY is not configured
 */
function getStripeClient(): Stripe | null {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  });

  return stripeClient;
}

/**
 * @deprecated Use PaymentService from @/lib/payment instead.
 * This getter provides backward compatibility but will warn in development.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const client = getStripeClient();
    if (!client) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Use PaymentService from @/lib/payment for provider-agnostic operations.'
      );
    }
    return (client as any)[prop];
  },
});

/**
 * Get the raw Stripe client for webhook processing.
 * This is the preferred way to access Stripe for webhooks.
 */
export function getStripeForWebhook(): Stripe {
  const client = getStripeClient();
  if (!client) {
    throw new Error('STRIPE_SECRET_KEY is required for webhook processing');
  }
  return client;
}
