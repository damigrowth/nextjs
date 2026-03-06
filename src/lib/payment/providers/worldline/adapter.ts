import type {
  PaymentProvider,
  PaymentProviderName,
  CheckoutSessionParams,
  CheckoutSession,
} from '../../types';
import { ProviderNotConfiguredError, ProviderOperationError } from '../../types';
import { getWorldlineConfig } from '../../worldline-config';
import { calculateRequestDigest } from './digest';
import { cancelRecurring } from './xml';

/**
 * Worldline/Cardlink Adapter
 *
 * Implements PaymentProvider using Cardlink's redirect integration for checkout
 * and Direct XML API for recurring operations.
 *
 * Flow:
 * 1. createCheckoutSession builds form params + digest, returns auto-submit page URL
 * 2. User is redirected to Cardlink payment page
 * 3. Cardlink POSTs result to our confirmUrl/cancelUrl (handled by webhook route)
 * 4. Recurring charges handled by cron job via XML API
 *
 * Digest approach matches official Cardlink WooCommerce plugin:
 * - Only include fields with values (no empty padding)
 * - Digest = base64(sha256(implode(field_values) + secret))
 * - See https://github.com/cardlink-sa/cardlink-payment-gateway-woocommerce
 */
export class WorldlineAdapter implements PaymentProvider {
  name: PaymentProviderName = 'worldline';

  async initialize(): Promise<void> {
    const config = getWorldlineConfig();
    if (!config.mid || !config.sharedSecret) {
      console.warn('Worldline adapter initialized but credentials not available');
    }
  }

  private getConfig() {
    const config = getWorldlineConfig();
    if (!config.mid || !config.sharedSecret) {
      throw new ProviderNotConfiguredError('worldline');
    }
    return config as { mid: string; sharedSecret: string; redirectUrl: string; xmlUrl: string; isTestMode: boolean };
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    try {
      const config = this.getConfig();
      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

      // Build unique order ID encoding the profileId for callback mapping
      const timestamp = Date.now().toString(36);
      const safeProfileId = params.profileId.replace(/[^a-zA-Z0-9]/g, '');
      const orderId = `DOL${safeProfileId}${timestamp}`.slice(0, 50);

      // Calculate amount based on plan and interval
      const amount = this.getAmount(params.plan, params.billingInterval);

      // Calculate recurring end date (1 year from now, renewed on each charge)
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      const recurringEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');

      const recurringFrequency = params.billingInterval === 'year' ? '365' : '30';

      // Build form fields — only include fields with values.
      // This matches the official Cardlink WooCommerce plugin behavior.
      // The field ORDER matters for digest calculation (JS objects maintain insertion order).
      const formFields: Record<string, string> = {
        version: '2',
        mid: config.mid,
        lang: 'el',
        orderid: orderId,
        orderDesc: `Doulitsa ${params.plan} - ${params.billingInterval === 'year' ? 'Ετήσια' : 'Μηνιαία'}`,
        orderAmount: amount,
        currency: 'EUR',
        payerEmail: params.billing?.email || '',
        payerPhone: params.billing?.phone || '',
        billCountry: params.billing?.address?.country || 'GR',
        billZip: params.billing?.address?.postalCode || '',
        billCity: params.billing?.address?.city || '',
        billAddress: params.billing?.address?.line1 || '',
        trType: '1',
        extRecurringfrequency: recurringFrequency,
        extRecurringenddate: recurringEndDate,
        confirmUrl: `${baseUrl}/api/webhooks/worldline`,
        cancelUrl: `${baseUrl}/api/webhooks/worldline`,
        var1: params.profileId,
        var2: params.plan,
        var3: params.billingInterval,
        extTokenOptions: '100',
      };

      // Remove fields with empty values (matching official plugin — they never add empty fields)
      for (const key of Object.keys(formFields)) {
        if (formFields[key] === '') {
          delete formFields[key];
        }
      }

      const digest = calculateRequestDigest(formFields, config.sharedSecret);

      const sessionId = `wl_${orderId}`;

      // Encode params as URL-safe base64 for the redirect page
      const encodedParams = Buffer.from(
        JSON.stringify({ ...formFields, digest }),
      ).toString('base64url');

      return {
        url: `${baseUrl}/api/payment/worldline/redirect?session=${encodedParams}`,
        sessionId,
      };
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) throw error;
      throw new ProviderOperationError('worldline', 'createCheckoutSession', error);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const result = await cancelRecurring({ orderId: subscriptionId });

      if (result.status !== 'CANCELED' && result.status !== 'CAPTURED') {
        throw new Error(`Cancel failed with status: ${result.status} - ${result.message}`);
      }
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) throw error;
      throw new ProviderOperationError('worldline', 'cancelSubscription', error);
    }
  }

  async restoreSubscription(_subscriptionId: string): Promise<void> {
    throw new ProviderOperationError(
      'worldline',
      'restoreSubscription',
      new Error('Worldline does not support restoring canceled subscriptions. User must re-subscribe.'),
    );
  }

  /**
   * Get subscription amount based on plan and billing interval.
   * TODO: Move pricing to a shared config or DB when adding more plans.
   */
  private getAmount(plan: string, billingInterval: string): string {
    if (plan === 'promoted') {
      if (billingInterval === 'year') {
        return '119.88';
      }
      return '9.99';
    }
    throw new Error(`Unknown plan: ${plan}`);
  }
}
