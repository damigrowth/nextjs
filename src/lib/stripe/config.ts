/**
 * Subscription plan configuration and pricing constants.
 * Provider-agnostic business logic for subscription features.
 *
 * NOTE: This file is maintained for backward compatibility.
 * New code should import from @/lib/payment for provider abstraction.
 *
 * PROMOTED plan benefits (from issue #411):
 * - Profile featured placement in archives (top positions with rotation)
 * - Up to 15 published services (free: 5)
 * - Up to 5 featured services (star icon in dashboard)
 * - Automatic daily refresh for all published services
 * - Priority in "Similar Services" section on service pages
 * - "Additional Services" section on subscriber's service pages.
 */

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Βασικό',
    maxServices: 5,
    maxFeaturedServices: 0,
    maxDailyRefreshes: 10,
    autoRefresh: false,
    featuredPlacement: false,
    prioritySimilar: false,
    additionalServicesSection: false,
  },
  promoted: {
    name: 'Προωθημένο',
    maxServices: 15,
    maxFeaturedServices: 5,
    maxDailyRefreshes: Infinity,
    autoRefresh: true,
    featuredPlacement: true,
    prioritySimilar: true,
    additionalServicesSection: true,
  },
} as const;

export const PRICING = {
  monthly: {
    amount: 2000, // €20.00 in cents
    label: '20€/μήνα',
    interval: 'month' as const,
    // Provider-specific price IDs
    stripePriceId: process.env.STRIPE_PROMOTED_MONTHLY_PRICE_ID || '',
    // Future: paypalPlanId, eurobankProductId, etc.
  },
  annual: {
    amount: 18000, // €180.00 in cents (€15/month × 12)
    label: '15€/μήνα',
    sublabel: '180€/έτος (3 μήνες δώρο)',
    interval: 'year' as const,
    // Provider-specific price IDs
    stripePriceId: process.env.STRIPE_PROMOTED_ANNUAL_PRICE_ID || '',
    // Future: paypalPlanId, eurobankProductId, etc.
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;
export type PricingKey = keyof typeof PRICING;
