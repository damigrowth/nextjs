import type { PaymentProvider, PaymentProviderName } from './types';

/**
 * Provider registry (singleton)
 * Stores initialized provider instances for reuse
 */
const providers = new Map<PaymentProviderName, PaymentProvider>();

/**
 * Get payment provider by name
 * Returns cached instance if available, otherwise creates new instance
 *
 * @param name - Provider name ('stripe' | 'paypal' | 'eurobank')
 * @returns Provider instance or null if not configured
 */
export function getProvider(name: string): PaymentProvider | null {
  const providerName = name as PaymentProviderName;

  // Return cached instance
  if (providers.has(providerName)) {
    return providers.get(providerName)!;
  }

  // Lazy load provider implementation
  let provider: PaymentProvider | null = null;

  switch (providerName) {
    case 'stripe':
      // Dynamic import to prevent module-load crashes
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { StripeAdapter } = require('./providers/stripe/adapter');
        provider = new StripeAdapter();
      } catch (error) {
        console.warn(`Failed to load Stripe provider:`, error);
        return null;
      }
      break;

    case 'paypal':
      // Future: PayPal implementation
      console.warn('PayPal provider not yet implemented');
      return null;

    case 'eurobank':
      // Future: Eurobank implementation
      console.warn('Eurobank provider not yet implemented');
      return null;

    case 'lemonsqueezy':
      // Future: LemonSqueezy implementation
      console.warn('LemonSqueezy provider not yet implemented');
      return null;

    default:
      console.warn(`Unknown payment provider: ${name}`);
      return null;
  }

  // Cache provider instance
  if (provider) {
    providers.set(providerName, provider);
  }

  return provider;
}

/**
 * Get default provider from environment
 */
export function getDefaultProvider(): PaymentProvider | null {
  const defaultName = (process.env.DEFAULT_PAYMENT_PROVIDER || 'stripe') as PaymentProviderName;
  return getProvider(defaultName);
}

/**
 * Clear provider cache (useful for testing)
 */
export function clearProviderCache(): void {
  providers.clear();
}
