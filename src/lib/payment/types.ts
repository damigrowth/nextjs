/**
 * Payment provider abstraction types.
 * Defines provider-agnostic interfaces for subscription management.
 */

import type { SubscriptionPlan, BillingInterval } from '@prisma/client';

/**
 * Supported payment providers
 */
export type PaymentProviderName = 'stripe' | 'paypal' | 'eurobank' | 'lemonsqueezy';

/**
 * Billing details for prefilling checkout (optional)
 */
export interface CheckoutBillingDetails {
  email?: string;
  name?: string; // Business name or full name
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string; // ISO 3166-1 alpha-2 (e.g., 'GR')
  };
  taxId?: string; // Greek AFM or other tax ID
  /** Greek tax office (ΔΟΥ) */
  taxOffice?: string;
  /** Profession (Επάγγελμα) */
  profession?: string;
  /** If true, user selected invoice (Τιμολόγιο) - prefill business details */
  isBusinessPurchase?: boolean;
}

/**
 * Checkout session parameters (provider-agnostic)
 * Uses Prisma-generated enums for type safety
 */
export interface CheckoutSessionParams {
  profileId: string;
  plan: SubscriptionPlan; // Using Prisma enum: 'free' | 'promoted'
  billingInterval: BillingInterval; // Using Prisma enum: 'month' | 'year'
  successUrl: string;
  cancelUrl: string;
  /** Optional billing details to prefill checkout */
  billing?: CheckoutBillingDetails;
}

/**
 * Checkout session result
 */
export interface CheckoutSession {
  url: string;
  sessionId: string;
}

/**
 * Customer portal parameters (optional for providers)
 */
export interface CustomerPortalParams {
  profileId: string;
  returnUrl: string;
}

/**
 * Payment provider interface
 * All payment providers must implement this interface
 */
export interface PaymentProvider {
  /** Provider name identifier */
  name: PaymentProviderName;

  /** Initialize provider (lazy loading) */
  initialize(): Promise<void>;

  /** Create checkout session for subscription */
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession>;

  /** Cancel subscription */
  cancelSubscription(subscriptionId: string): Promise<void>;

  /** Restore canceled subscription */
  restoreSubscription(subscriptionId: string): Promise<void>;

  /** Create customer portal (optional) */
  createCustomerPortal?(params: CustomerPortalParams): Promise<{ url: string }>;
}

/**
 * Provider initialization error
 */
export class ProviderNotConfiguredError extends Error {
  constructor(providerName: string) {
    super(`Payment provider "${providerName}" is not configured. Check environment variables.`);
    this.name = 'ProviderNotConfiguredError';
  }
}

/**
 * Provider operation error
 */
export class ProviderOperationError extends Error {
  readonly originalError?: unknown;

  constructor(providerName: string, operation: string, originalError?: unknown) {
    const message = `Payment provider "${providerName}" failed during "${operation}": ${originalError instanceof Error ? originalError.message : String(originalError)}`;
    super(message);
    this.name = 'ProviderOperationError';
    this.originalError = originalError;
  }
}
