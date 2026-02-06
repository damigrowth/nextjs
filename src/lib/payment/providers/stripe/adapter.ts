import Stripe from 'stripe';
import type {
  PaymentProvider,
  PaymentProviderName,
  CheckoutSessionParams,
  CheckoutSession,
  CustomerPortalParams,
} from '../../types';
import { ProviderNotConfiguredError, ProviderOperationError } from '../../types';
import { getStripeSecretKey, getStripePriceId } from '../../stripe-config';

/**
 * Lazy Stripe client getter
 * Returns null if Stripe is not configured
 * Automatically uses test or live keys based on PAYMENTS_TEST_MODE
 */
function getStripeClient(): Stripe | null {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    return null;
  }

  try {
    return new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  } catch (error) {
    console.warn('Failed to initialize Stripe client:', error);
    return null;
  }
}

/**
 * Get Stripe price ID for the given plan and billing interval
 * Automatically uses test or live price IDs based on PAYMENTS_TEST_MODE
 */
function getPriceId(plan: string, billingInterval: string): string {
  return getStripePriceId(plan, billingInterval);
}

/**
 * Stripe Adapter
 *
 * Implements the PaymentProvider interface using Stripe's native SDK.
 * This adapter can work standalone or alongside Better Auth's Stripe plugin.
 *
 * The Better Auth plugin handles webhooks and subscription state syncing,
 * while this adapter provides direct API access for creating checkout sessions.
 */
export class StripeAdapter implements PaymentProvider {
  name: PaymentProviderName = 'stripe';
  private client: Stripe | null = null;

  async initialize(): Promise<void> {
    this.client = getStripeClient();
    if (!this.client) {
      console.warn('Stripe adapter initialized but client not available');
    }
  }

  private getClient(): Stripe {
    if (!this.client) {
      this.client = getStripeClient();
    }

    if (!this.client) {
      throw new ProviderNotConfiguredError('stripe');
    }

    return this.client;
  }

  /**
   * Create a Stripe Checkout session
   */
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    try {
      const stripe = this.getClient();
      const priceId = getPriceId(params.plan, params.billingInterval);

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        // Store profile ID in metadata for webhook processing
        metadata: {
          profileId: params.profileId,
          plan: params.plan,
          billingInterval: params.billingInterval,
        },
        // Client reference ID for Better Auth integration
        client_reference_id: params.profileId,
        // Allow promotion codes
        allow_promotion_codes: true,
        // Billing address collection
        billing_address_collection: 'required',
        // Tax ID collection for Greek businesses
        tax_id_collection: {
          enabled: true,
        },
      });

      if (!session.url) {
        throw new Error('Stripe returned session without URL');
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) {
        throw error;
      }
      throw new ProviderOperationError('stripe', 'createCheckoutSession', error);
    }
  }

  /**
   * Cancel a Stripe subscription
   * By default, cancels at end of billing period (cancel_at_period_end)
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const stripe = this.getClient();

      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) {
        throw error;
      }
      throw new ProviderOperationError('stripe', 'cancelSubscription', error);
    }
  }

  /**
   * Restore a subscription that was scheduled for cancellation
   */
  async restoreSubscription(subscriptionId: string): Promise<void> {
    try {
      const stripe = this.getClient();

      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) {
        throw error;
      }
      throw new ProviderOperationError('stripe', 'restoreSubscription', error);
    }
  }

  /**
   * Create a Stripe Customer Portal session
   * Allows customers to manage their subscription (update payment method, view invoices, etc.)
   */
  async createCustomerPortal(params: CustomerPortalParams): Promise<{ url: string }> {
    try {
      const stripe = this.getClient();

      // First, we need to get the customer ID from the subscription
      // This requires looking up the profile's subscription
      const { prisma } = await import('@/lib/prisma/client');

      const subscription = await prisma.subscription.findUnique({
        where: { pid: params.profileId },
        select: {
          providerCustomerId: true,
          stripeCustomerId: true,
        },
      });

      const customerId = subscription?.providerCustomerId || subscription?.stripeCustomerId;

      if (!customerId) {
        throw new Error('No Stripe customer ID found for this profile');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: params.returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) {
        throw error;
      }
      throw new ProviderOperationError('stripe', 'createCustomerPortal', error);
    }
  }
}
