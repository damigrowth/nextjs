import { prisma } from '@/lib/prisma/client';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  type SubscriptionProvider,
} from '@prisma/client';
import { getProvider } from './factory';
import type { CheckoutSessionParams, CustomerPortalParams } from './types';
import { ProviderNotConfiguredError } from './types';

/**
 * PaymentService - Provider-agnostic facade for subscription management.
 *
 * This is the ONLY interface your app code should use for payments.
 * Never call provider adapters or Stripe SDK directly.
 *
 * Benefits:
 * - Provider independence (switch providers via env var)
 * - Consistent API across all providers
 * - Easier testing (mock this service)
 * - Single source of truth (your Prisma DB)
 */
export class PaymentService {
  /**
   * Create a checkout session (provider-agnostic)
   */
  static async createCheckout(params: CheckoutSessionParams) {
    // Get subscription to determine which provider to use
    const subscription = await prisma.subscription.findUnique({
      where: { pid: params.profileId },
    });

    // Determine provider: existing subscription provider > env default > 'stripe'
    const providerName: SubscriptionProvider =
      subscription?.provider ||
      (process.env.DEFAULT_PAYMENT_PROVIDER as SubscriptionProvider) ||
      'stripe';

    // Get provider implementation
    const provider = getProvider(providerName);
    if (!provider) {
      throw new ProviderNotConfiguredError(providerName);
    }

    // Delegate to provider
    const session = await provider.createCheckoutSession(params);

    // Update YOUR database (source of truth)
    await prisma.subscription.upsert({
      where: { pid: params.profileId },
      create: {
        pid: params.profileId,
        provider: providerName,
        providerCustomerId: '', // Will be set by webhook
        stripeCustomerId: '', // Legacy field - will be set by webhook for Stripe
        plan: SubscriptionPlan.free,
        status: SubscriptionStatus.incomplete,
      },
      update: {
        // Track that checkout was initiated
        updatedAt: new Date(),
      },
    });

    return session;
  }

  /**
   * Cancel subscription (provider-agnostic)
   */
  static async cancelSubscription(profileId: string, cancelAtPeriodEnd: boolean = true) {
    const subscription = await prisma.subscription.findUnique({
      where: { pid: profileId },
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    // Get the subscription ID - use new field or fall back to legacy
    const subscriptionId = subscription.providerSubscriptionId || subscription.stripeSubscriptionId;

    if (!subscriptionId) {
      throw new Error('No active subscription found');
    }

    const provider = getProvider(subscription.provider);
    if (!provider) {
      throw new ProviderNotConfiguredError(subscription.provider);
    }

    // Cancel with provider
    await provider.cancelSubscription(subscriptionId);

    // Update YOUR database
    await prisma.subscription.update({
      where: { pid: profileId },
      data: {
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? new Date() : null,
      },
    });
  }

  /**
   * Restore canceled subscription (provider-agnostic)
   */
  static async restoreSubscription(profileId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { pid: profileId },
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    // Get the subscription ID - use new field or fall back to legacy
    const subscriptionId = subscription.providerSubscriptionId || subscription.stripeSubscriptionId;

    if (!subscriptionId) {
      throw new Error('No subscription found');
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new Error('Subscription is not scheduled for cancellation');
    }

    const provider = getProvider(subscription.provider);
    if (!provider) {
      throw new ProviderNotConfiguredError(subscription.provider);
    }

    // Restore with provider
    await provider.restoreSubscription(subscriptionId);

    // Update YOUR database
    await prisma.subscription.update({
      where: { pid: profileId },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });
  }

  /**
   * Create customer portal (provider-agnostic, optional)
   */
  static async createCustomerPortal(params: CustomerPortalParams) {
    const subscription = await prisma.subscription.findUnique({
      where: { pid: params.profileId },
    });

    if (!subscription) {
      throw new Error('No subscription found');
    }

    const provider = getProvider(subscription.provider);
    if (!provider) {
      throw new ProviderNotConfiguredError(subscription.provider);
    }

    if (!provider.createCustomerPortal) {
      throw new Error(`Provider ${subscription.provider} does not support customer portal`);
    }

    return provider.createCustomerPortal(params);
  }

  /**
   * Get active subscription (from YOUR database)
   */
  static async getSubscription(profileId: string) {
    return prisma.subscription.findUnique({
      where: { pid: profileId },
    });
  }
}
