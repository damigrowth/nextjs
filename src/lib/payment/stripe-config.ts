/**
 * Stripe Configuration
 *
 * Automatically selects test or live Stripe credentials based on PAYMENTS_TEST_MODE.
 * This prevents manual key swapping errors when transitioning between test and production.
 *
 * Environment Variables Required:
 * - Test Mode (PAYMENTS_TEST_MODE=true):
 *   - STRIPE_TEST_SECRET_KEY (server-side)
 *   - STRIPE_TEST_PUBLISHABLE_KEY (client-side)
 *   - STRIPE_TEST_WEBHOOK_SECRET
 *   - STRIPE_TEST_PROMOTED_MONTHLY_PRICE_ID
 *   - STRIPE_TEST_PROMOTED_ANNUAL_PRICE_ID
 *
 * - Live Mode (PAYMENTS_TEST_MODE=false):
 *   - STRIPE_LIVE_SECRET_KEY (server-side)
 *   - STRIPE_LIVE_PUBLISHABLE_KEY (client-side)
 *   - STRIPE_LIVE_WEBHOOK_SECRET
 *   - STRIPE_LIVE_PROMOTED_MONTHLY_PRICE_ID
 *   - STRIPE_LIVE_PROMOTED_ANNUAL_PRICE_ID
 */

import { isPaymentsTestMode } from './test-mode';

/**
 * Stripe configuration based on current mode
 */
export interface StripeConfig {
  secretKey: string | undefined;
  publishableKey: string | undefined;
  webhookSecret: string | undefined;
  promotedMonthlyPriceId: string | undefined;
  promotedAnnualPriceId: string | undefined;
  isTestMode: boolean;
}

/**
 * Get Stripe configuration based on PAYMENTS_TEST_MODE
 *
 * Returns test credentials when PAYMENTS_TEST_MODE=true
 * Returns live credentials when PAYMENTS_TEST_MODE=false
 */
export function getStripeConfig(): StripeConfig {
  const testMode = isPaymentsTestMode();

  if (testMode) {
    return {
      secretKey: process.env.STRIPE_TEST_SECRET_KEY,
      publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET,
      promotedMonthlyPriceId: process.env.STRIPE_TEST_PROMOTED_MONTHLY_PRICE_ID,
      promotedAnnualPriceId: process.env.STRIPE_TEST_PROMOTED_ANNUAL_PRICE_ID,
      isTestMode: true,
    };
  }

  return {
    secretKey: process.env.STRIPE_LIVE_SECRET_KEY,
    publishableKey: process.env.STRIPE_LIVE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_LIVE_WEBHOOK_SECRET,
    promotedMonthlyPriceId: process.env.STRIPE_LIVE_PROMOTED_MONTHLY_PRICE_ID,
    promotedAnnualPriceId: process.env.STRIPE_LIVE_PROMOTED_ANNUAL_PRICE_ID,
    isTestMode: false,
  };
}

/**
 * Get Stripe secret key for current mode (server-side)
 */
export function getStripeSecretKey(): string | undefined {
  return getStripeConfig().secretKey;
}

/**
 * Get Stripe publishable key for current mode (client-side)
 */
export function getStripePublishableKey(): string | undefined {
  return getStripeConfig().publishableKey;
}

/**
 * Get Stripe webhook secret for current mode
 */
export function getStripeWebhookSecret(): string | undefined {
  return getStripeConfig().webhookSecret;
}

/**
 * Get Stripe price ID for given plan and billing interval
 */
export function getStripePriceId(plan: string, billingInterval: string): string {
  const config = getStripeConfig();

  if (plan === 'promoted') {
    if (billingInterval === 'year') {
      if (!config.promotedAnnualPriceId) {
        const mode = config.isTestMode ? 'TEST' : 'LIVE';
        throw new Error(`STRIPE_${mode}_PROMOTED_ANNUAL_PRICE_ID not configured`);
      }
      return config.promotedAnnualPriceId;
    } else {
      if (!config.promotedMonthlyPriceId) {
        const mode = config.isTestMode ? 'TEST' : 'LIVE';
        throw new Error(`STRIPE_${mode}_PROMOTED_MONTHLY_PRICE_ID not configured`);
      }
      return config.promotedMonthlyPriceId;
    }
  }

  throw new Error(`Unknown plan: ${plan}`);
}
