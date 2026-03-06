import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import {
  SubscriptionProvider,
  SubscriptionStatus,
  SubscriptionPlan,
  BillingInterval,
} from '@prisma/client';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { executeRecurringCharge } from '@/lib/payment/providers/worldline/xml';

/**
 * Worldline recurring billing cron job.
 *
 * Runs daily. Finds Worldline subscriptions approaching their period end
 * and charges them using the stored token via the Direct XML API.
 *
 * Unlike Stripe (which handles recurring billing automatically),
 * Worldline requires us to trigger each renewal ourselves.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    // Find subscriptions expiring within the next 24 hours
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueSubs = await prisma.subscription.findMany({
      where: {
        provider: SubscriptionProvider.worldline,
        status: SubscriptionStatus.active,
        plan: SubscriptionPlan.promoted,
        cancelAtPeriodEnd: false,
        worldlineToken: { not: null },
        currentPeriodEnd: { lte: tomorrow },
      },
      include: {
        profile: {
          select: {
            id: true,
            uid: true,
            username: true,
            category: true,
          },
        },
      },
    });

    const results = {
      total: dueSubs.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const sub of dueSubs) {
      if (!sub.worldlineToken) continue;

      try {
        // Generate new orderId for this renewal
        const renewalOrderId = `RNW${sub.pid.replace(/[^a-zA-Z0-9]/g, '')}${Date.now().toString(36)}`.slice(0, 50);

        // Calculate amount
        const amount = sub.billingInterval === BillingInterval.year ? '119.88' : '9.99';

        // Calculate recurring end date (extend 1 year)
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        const recurringEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');

        const frequencyDays = sub.billingInterval === BillingInterval.year ? '365' : '30';

        // Get payer email from profile's user
        const user = await prisma.user.findUnique({
          where: { id: sub.profile.uid },
          select: { email: true },
        });

        const result = await executeRecurringCharge({
          orderId: renewalOrderId,
          amount,
          currency: sub.currency || 'EUR',
          email: user?.email || '',
          token: sub.worldlineToken,
          recurringFrequency: frequencyDays,
          recurringEndDate,
        });

        if (result.status === 'CAPTURED' || result.status === 'AUTHORIZED') {
          // Success — extend subscription period
          const newPeriodStart = sub.currentPeriodEnd || now;
          const newPeriodEnd = new Date(newPeriodStart);
          if (sub.billingInterval === BillingInterval.year) {
            newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
          } else {
            newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
          }

          const amountCents = Math.round(parseFloat(amount) * 100);

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              currentPeriodStart: newPeriodStart,
              currentPeriodEnd: newPeriodEnd,
              lastPaymentAt: now,
              paymentCount: { increment: 1 },
              totalPaidLifetime: { increment: amountCents },
              amount: amountCents,
            },
          });

          results.success++;
        } else {
          // Failed — mark as past_due
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: SubscriptionStatus.past_due },
          });

          await prisma.profile.update({
            where: { id: sub.pid },
            data: { featured: false },
          });

          await revalidateProfile({
            profileId: sub.pid,
            userId: sub.profile.uid,
            username: sub.profile.username,
            category: sub.profile.category,
            includeHome: true,
            includeServices: true,
          });
          logCacheRevalidation('profile', sub.pid, 'worldline renewal failed');

          results.failed++;
          results.errors.push(`${sub.pid}: ${result.status} - ${result.message}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${sub.pid}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log('[Worldline Renewals]', JSON.stringify(results));
    return NextResponse.json(results);
  } catch (error) {
    console.error('[Worldline Renewals] Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 },
    );
  }
}
