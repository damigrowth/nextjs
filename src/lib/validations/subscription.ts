import { z } from 'zod';

/**
 * Subscription Validation Schemas
 * Provider-agnostic schemas for subscription operations
 */

// Subscription plan enum (matches Prisma SubscriptionPlan)
export const subscriptionPlanSchema = z.enum(['free', 'promoted']);

// Billing interval enum (matches Prisma BillingInterval)
export const billingIntervalSchema = z.enum(['month', 'year']);

// Subscription status enum (matches Prisma SubscriptionStatus)
export const subscriptionStatusSchema = z.enum([
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'trialing',
  'unpaid',
]);

/**
 * Create checkout session input
 * Used by PaymentService.createCheckout
 */
export const createCheckoutSessionSchema = z.object({
  // Plan to subscribe to (default: promoted for upgrades)
  plan: subscriptionPlanSchema.default('promoted'),
  // Billing interval (monthly or yearly)
  billingInterval: billingIntervalSchema,
});

/**
 * Cancel subscription input
 */
export const cancelSubscriptionSchema = z.object({
  // If true, subscription will cancel at end of billing period
  // If false, subscription will cancel immediately
  cancelAtPeriodEnd: z.boolean().default(true),
});

/**
 * Restore subscription input (empty - just needs profileId from auth)
 */
export const restoreSubscriptionSchema = z.object({});

/**
 * Customer portal input
 */
export const customerPortalSchema = z.object({
  returnUrl: z.string().url().optional(),
});

// Type exports
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type BillingInterval = z.infer<typeof billingIntervalSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type RestoreSubscriptionInput = z.infer<typeof restoreSubscriptionSchema>;
export type CustomerPortalInput = z.infer<typeof customerPortalSchema>;
