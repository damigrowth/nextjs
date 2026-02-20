import { prisma } from '@/lib/prisma/client';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import { SUBSCRIPTION_PLANS, type PlanKey } from '@/lib/stripe/config';

/**
 * Get the active plan for a profile.
 * Returns 'free' if no active subscription exists.
 */
export async function getActivePlan(profileId: string): Promise<PlanKey> {
  const subscription = await prisma.subscription.findUnique({
    where: { pid: profileId },
    select: { plan: true, status: true },
  });

  if (subscription?.status === SubscriptionStatus.active && subscription.plan === SubscriptionPlan.promoted) {
    return SubscriptionPlan.promoted;
  }

  return SubscriptionPlan.free;
}

/**
 * Get plan limits for a profile.
 */
export async function getPlanLimits(profileId: string) {
  const plan = await getActivePlan(profileId);
  return SUBSCRIPTION_PLANS[plan];
}

/**
 * Check if a profile can publish more services.
 */
export async function canPublishService(profileId: string): Promise<boolean> {
  const plan = await getActivePlan(profileId);
  const limits = SUBSCRIPTION_PLANS[plan];

  const publishedCount = await prisma.service.count({
    where: { pid: profileId, status: 'published' },
  });

  return publishedCount < limits.maxServices;
}

/**
 * Check if a profile can feature more services.
 */
export async function canFeatureService(profileId: string): Promise<boolean> {
  const plan = await getActivePlan(profileId);
  const limits = SUBSCRIPTION_PLANS[plan];

  if (limits.maxFeaturedServices === 0) return false;

  const featuredCount = await prisma.service.count({
    where: { pid: profileId, featured: true },
  });

  return featuredCount < limits.maxFeaturedServices;
}

/**
 * Check if a profile has auto-refresh enabled.
 */
export async function hasAutoRefresh(profileId: string): Promise<boolean> {
  const plan = await getActivePlan(profileId);
  return SUBSCRIPTION_PLANS[plan].autoRefresh;
}

/**
 * Get the number of remaining featured service slots.
 */
export async function getRemainingFeaturedSlots(profileId: string): Promise<number> {
  const plan = await getActivePlan(profileId);
  const limits = SUBSCRIPTION_PLANS[plan];

  const featuredCount = await prisma.service.count({
    where: { pid: profileId, featured: true },
  });

  return Math.max(0, limits.maxFeaturedServices - featuredCount);
}
