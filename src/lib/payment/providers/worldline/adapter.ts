import type {
  PaymentProvider,
  PaymentProviderName,
  CheckoutSessionParams,
  CheckoutSession,
} from '../../types';
import { ProviderNotConfiguredError, ProviderOperationError } from '../../types';
import { getWorldlineConfig } from '../../worldline-config';
import { getPlanAmount } from '../../pricing';
import { calculateRequestDigest } from './digest';
import { cancelRecurring } from './xml';

/**
 * Worldline/Cardlink Adapter
 *
 * Implements PaymentProvider using Cardlink's redirect integration for checkout
 * and Direct XML API for cancel/recurring operations.
 *
 * Flow:
 * 1. createCheckoutSession builds form params + digest, returns auto-submit page URL
 * 2. User is redirected to Cardlink payment page
 * 3. Cardlink POSTs result to our confirmUrl/cancelUrl (handled by webhook route)
 * 4. Cardlink auto-charges recurring via Scheduled Recurring (sends webhook notifications)
 * 5. Cancel via RecurringOperationRequest XML API
 *
 * Digest: Fixed 46-field order, verified empirically against Cardlink sandbox.
 * Key finding: extTokenOptions/extToken go between cancelUrl and var1.
 * See digest.ts for the exact field order.
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

      const amount = getPlanAmount(params.plan, params.billingInterval);

      // Calculate recurring end date (1 year from now, renewed on each charge)
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      const recurringEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');

      const recurringFrequency = params.billingInterval === 'year' ? '365' : '30';

      // Build form fields. Digest uses fixed 46-field order (see digest.ts).
      const formFields: Record<string, string> = {
        version: '2',
        mid: config.mid,
        lang: 'el',
        deviceCategory: '0',
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
        extTokenOptions: '100',
        var1: params.profileId,
        var2: params.plan,
        var3: params.billingInterval,
      };

      // Digest calculated from fixed 46-field order (handles field positioning)
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
      if (result.status !== 'CANCELED') {
        throw new Error(`Worldline cancel failed: ${result.status} - ${result.message || 'unknown error'}`);
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

}
