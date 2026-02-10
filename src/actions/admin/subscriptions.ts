'use server';

import { prisma } from '@/lib/prisma/client';
import {
  adminListSubscriptionsSchema,
  adminUpdateSubscriptionStatusSchema,
  adminDeleteSubscriptionSchema,
  type AdminListSubscriptionsInput,
  type AdminUpdateSubscriptionStatusInput,
  type AdminDeleteSubscriptionInput,
} from '@/lib/validations/admin';
import { getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';

/**
 * List subscriptions with filters and pagination
 */
export async function listSubscriptions(
  params: Partial<AdminListSubscriptionsInput> = {},
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SUBSCRIPTIONS, 'view');

    const validatedParams = adminListSubscriptionsSchema.parse(params);

    const {
      searchQuery,
      status,
      plan,
      billingInterval,
      limit,
      offset,
      sortBy,
      sortDirection,
    } = validatedParams;

    // Build where clause
    const where: any = {};

    // Search filter (profile displayName or user email)
    if (searchQuery) {
      where.profile = {
        OR: [
          { displayName: { contains: searchQuery, mode: 'insensitive' } },
          { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
        ],
      };
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Plan filter
    if (plan && plan !== 'all') {
      where.plan = plan;
    }

    // Billing interval filter
    if (billingInterval && billingInterval !== 'all') {
      where.billingInterval = billingInterval;
    }

    // Execute query
    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          profile: {
            select: {
              id: true,
              displayName: true,
              image: true,
              username: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortDirection,
        },
        take: limit,
        skip: offset,
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      success: true,
      data: {
        subscriptions,
        total,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to list subscriptions',
    };
  }
}

/**
 * Get single subscription with full details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SUBSCRIPTIONS, 'view');

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        profile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return {
        success: false,
        error: 'Subscription not found',
      };
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch subscription',
    };
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  params: AdminUpdateSubscriptionStatusInput,
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SUBSCRIPTIONS, 'edit');

    const validatedParams = adminUpdateSubscriptionStatusSchema.parse(params);

    const { subscriptionId, status } = validatedParams;

    // Update subscription status
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status,
        updatedAt: new Date(),
        // If canceling, set canceledAt
        ...(status === 'canceled' && { canceledAt: new Date() }),
      },
      include: {
        profile: {
          select: {
            id: true,
            displayName: true,
            featured: true,
          },
        },
      },
    });

    // If subscription is canceled, also update the profile's featured status
    if (status === 'canceled' && subscription.plan === 'promoted') {
      await prisma.profile.update({
        where: { id: subscription.pid },
        data: {
          featured: false,
        },
      });
    }

    // If subscription is reactivated, restore featured status for promoted plans
    if (status === 'active' && subscription.plan === 'promoted') {
      await prisma.profile.update({
        where: { id: subscription.pid },
        data: {
          featured: true,
        },
      });
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update subscription status',
    };
  }
}

/**
 * Delete subscription
 */
export async function deleteSubscription(params: AdminDeleteSubscriptionInput) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SUBSCRIPTIONS, 'full');

    const validatedParams = adminDeleteSubscriptionSchema.parse(params);
    const { subscriptionId } = validatedParams;

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { pid: true, plan: true },
    });

    if (!subscription) {
      return {
        success: false,
        error: 'Subscription not found',
      };
    }

    // Delete the subscription
    await prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    // Also remove featured status if it was a promoted subscription
    if (subscription.plan === 'promoted') {
      await prisma.profile.update({
        where: { id: subscription.pid },
        data: {
          featured: false,
        },
      });
    }

    return {
      success: true,
      data: { id: subscriptionId },
    };
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete subscription',
    };
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SUBSCRIPTIONS, 'view');

    const [total, active, canceled, pastDue] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({ where: { status: 'canceled' } }),
      prisma.subscription.count({ where: { status: 'past_due' } }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        canceled,
        pastDue,
      },
    };
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch subscription stats',
    };
  }
}

/**
 * Update subscription status - FormData version for useActionState
 */
export async function updateSubscriptionStatusAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const subscriptionId = formData.get('subscriptionId');
    const status = formData.get('status');
    const notes = formData.get('notes');

    if (!subscriptionId || !status) {
      return {
        success: false,
        error: 'Subscription ID and status are required',
      };
    }

    // Parse and validate
    const rawData = {
      subscriptionId: subscriptionId as string,
      status: status as string,
      notes: notes ? (notes as string) : undefined,
    };

    const validationResult =
      adminUpdateSubscriptionStatusSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error:
          'Validation failed: ' +
          validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateSubscriptionStatus(validationResult.data);
    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update subscription status',
    };
  }
}
