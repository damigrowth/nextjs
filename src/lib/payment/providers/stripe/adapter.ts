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
   * Prefills customer data from billing details if provided
   */
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    try {
      const stripe = this.getClient();
      const priceId = getPriceId(params.plan, params.billingInterval);
      const { prisma } = await import('@/lib/prisma/client');

      // Check for existing Stripe customer
      const existingSub = await prisma.subscription.findUnique({
        where: { pid: params.profileId },
        select: {
          stripeCustomerId: true,
          providerCustomerId: true,
        },
      });

      let customerId = existingSub?.providerCustomerId || existingSub?.stripeCustomerId;

      // Build customer data from billing details
      const billing = params.billing;

      const customerData: Stripe.CustomerCreateParams = {
        metadata: {
          profileId: params.profileId,
          // Store business details in metadata for invoice purposes
          ...(billing?.isBusinessPurchase
            ? {
                businessName: billing.name || '',
                isBusinessPurchase: 'true',
              }
            : {}),
        },
      };

      if (billing?.email) customerData.email = billing.email;
      if (billing?.phone) customerData.phone = billing.phone;

      // Set name fields based on purchase type
      if (billing?.isBusinessPurchase && billing?.name) {
        // For business purchases (Τιμολόγιο), set business_name field
        // This populates the "Business name" field in Stripe dashboard
        (customerData as Record<string, unknown>).business_name = billing.name;
        // Also set general name for display purposes
        customerData.name = billing.name;
      } else if (billing?.name) {
        // For individual purchases (Απόδειξη), set individual_name
        (customerData as Record<string, unknown>).individual_name = billing.name;
        customerData.name = billing.name;
      }

      // Add address if provided
      if (billing?.address?.line1) {
        customerData.address = {
          line1: billing.address.line1,
          line2: billing.address.line2 || undefined,
          city: billing.address.city || undefined,
          state: billing.address.state || undefined,
          postal_code: billing.address.postalCode || undefined,
          country: billing.address.country || 'GR',
        };
      }

      // For business purchases (Τιμολόγιο), add Greek invoice details to custom fields
      // This ensures Επωνυμία, ΔΟΥ, Επάγγελμα appear on invoices
      if (billing?.isBusinessPurchase) {
        const customFields: Array<{ name: string; value: string }> = [];

        if (billing.name) {
          customFields.push({ name: 'Επωνυμία', value: billing.name });
        }
        if (billing.taxOffice) {
          customFields.push({ name: 'ΔΟΥ', value: billing.taxOffice });
        }
        if (billing.profession) {
          customFields.push({ name: 'Επάγγελμα', value: billing.profession });
        }

        if (customFields.length > 0) {
          customerData.invoice_settings = {
            custom_fields: customFields,
          };
        }
      }

      // Create or update Stripe customer with billing details
      if (customerId) {
        await stripe.customers.update(customerId, customerData);
      } else if (billing?.email || billing?.name) {
        const customer = await stripe.customers.create(customerData);
        customerId = customer.id;
      }

      // Add Greek VAT (AFM) to customer if business purchase
      if (customerId && billing?.isBusinessPurchase && billing?.taxId) {
        try {
          // Check if tax ID already exists
          const existingTaxIds = await stripe.customers.listTaxIds(customerId);
          const hasExistingVat = existingTaxIds.data.some(
            (tid) => tid.value === `EL${billing.taxId}` || tid.value === billing.taxId,
          );

          if (!hasExistingVat) {
            // Add Greek VAT number (AFM prefixed with EL for EU VAT format)
            await stripe.customers.createTaxId(customerId, {
              type: 'eu_vat',
              value: `EL${billing.taxId}`, // Greek VAT format: EL + 9-digit AFM
            });
          }
        } catch (taxError) {
          // Log but don't fail checkout if tax ID addition fails
          console.warn('Failed to add tax ID to customer:', taxError);
        }
      }

      // Build checkout session options
      const sessionOptions: Stripe.Checkout.SessionCreateParams = {
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
        // Billing address collection - use 'auto' to prefill from customer
        billing_address_collection: customerId ? 'auto' : 'required',
        // Tax ID collection for Greek businesses
        tax_id_collection: {
          enabled: true,
        },
      };

      // Use existing customer or prefill email
      if (customerId) {
        sessionOptions.customer = customerId;
        // Only allow name to be updated from checkout - don't include 'address'
        // because we already set it on the customer and don't want checkout to overwrite it
        sessionOptions.customer_update = {
          name: 'auto',
          address: 'auto',
        };
      } else if (billing?.email) {
        sessionOptions.customer_email = billing.email;
      }

      const session = await stripe.checkout.sessions.create(sessionOptions);

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
