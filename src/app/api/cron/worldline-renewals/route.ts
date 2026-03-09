import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { SubscriptionProvider, SubscriptionStatus, SubscriptionPlan, BillingInterval } from '@prisma/client';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { executeRecurringCharge } from '@/lib/payment/providers/worldline/xml';
import { getPlanAmount } from '@/lib/payment/pricing';

/**
 * Maximum retry attempts for failed recurring charges.
 * After all retries exhausted, subscription is canceled.
 * Retries happen every 3 days (cron runs daily, checks retryAfter).
 */
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_INTERVAL_DAYS = 3;

/**
 * Check if a Worldline token has expired.
 * Token expiration format: YYYYMMDD
 */
function isTokenExpired(tokenExp: string | null): boolean {
  if (!tokenExp || tokenExp.length !== 8) return false;
  const year = parseInt(tokenExp.slice(0, 4));
  const month = parseInt(tokenExp.slice(4, 6)) - 1;
  const day = parseInt(tokenExp.slice(6, 8));
  const expDate = new Date(year, month, day);
  return expDate < new Date();
}

/**
 * Worldline recurring billing cron job.
 *
 * Runs daily at 6 AM (see vercel.json). Handles:
 * 1. Active subscriptions due for renewal (currentPeriodEnd <= tomorrow)
 * 2. Past-due subscriptions eligible for retry (up to 3 attempts over 9 days)
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
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Find active subscriptions due for renewal
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
        profile: { select: { id: true, uid: true, username: true, category: true } },
      },
    });

    // 2. Find past_due subscriptions eligible for retry
    const retryDate = new Date(now);
    retryDate.setDate(retryDate.getDate() - RETRY_INTERVAL_DAYS);

    const retrySubs = await prisma.subscription.findMany({
      where: {
        provider: SubscriptionProvider.worldline,
        status: SubscriptionStatus.past_due,
        plan: SubscriptionPlan.promoted,
        worldlineToken: { not: null },
        // Only retry if last attempt was >= RETRY_INTERVAL_DAYS ago
        lastPaymentAt: { lte: retryDate },
        // Only retry up to MAX_RETRY_ATTEMPTS (paymentCount tracks retries via metadata)
      },
      include: {
        profile: { select: { id: true, uid: true, username: true, category: true } },
      },
    });

    const results = {
      total: dueSubs.length + retrySubs.length,
      renewed: 0,
      retried: 0,
      failed: 0,
      expired_tokens: 0,
      canceled_after_retries: 0,
      errors: [] as string[],
    };

    // Process due renewals
    for (const sub of dueSubs) {
      await processRenewal(sub, now, results, false);
    }

    // Process retries for past_due
    for (const sub of retrySubs) {
      // Check how many days since the subscription went past_due
      const daysPastDue = sub.currentPeriodEnd
        ? Math.floor((now.getTime() - sub.currentPeriodEnd.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const maxRetryDays = MAX_RETRY_ATTEMPTS * RETRY_INTERVAL_DAYS;

      if (daysPastDue > maxRetryDays) {
        // Exhausted all retries — cancel subscription
        await cancelExpiredSubscription(sub, now);
        results.canceled_after_retries++;
        continue;
      }

      await processRenewal(sub, now, results, true);
    }

    console.log('[Worldline Renewals]', JSON.stringify(results));
    return NextResponse.json(results);
  } catch (error) {
    console.error('[Worldline Renewals] Cron job failed:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}

async function processRenewal(
  sub: Awaited<ReturnType<typeof prisma.subscription.findMany>>[number] & {
    profile: { id: string; uid: string; username: string | null; category: string | null };
  },
  now: Date,
  results: { renewed: number; retried: number; failed: number; expired_tokens: number; errors: string[] },
  isRetry: boolean,
) {
  if (!sub.worldlineToken) return;

  // Check token expiration
  if (isTokenExpired(sub.worldlineTokenExp)) {
    console.warn(`[Worldline Renewals] Token expired for ${sub.pid}, exp: ${sub.worldlineTokenExp}`);
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.past_due },
    });
    results.expired_tokens++;
    results.errors.push(`${sub.pid}: token expired (${sub.worldlineTokenExp})`);
    return;
  }

  try {
    const renewalOrderId = `RNW${sub.pid.replace(/[^a-zA-Z0-9]/g, '')}${Date.now().toString(36)}`.slice(0, 50);
    const interval = sub.billingInterval === BillingInterval.year ? 'year' : 'month';
    const amount = getPlanAmount('promoted', interval);
    const frequencyDays = sub.billingInterval === BillingInterval.year ? '365' : '30';

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    const recurringEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');

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
          status: SubscriptionStatus.active,
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          lastPaymentAt: now,
          paymentCount: { increment: 1 },
          totalPaidLifetime: { increment: amountCents },
          amount: amountCents,
        },
      });

      // Re-feature profile if it was a retry recovery
      if (isRetry) {
        await prisma.profile.update({
          where: { id: sub.pid },
          data: { featured: true },
        });
        await revalidateProfile({
          profileId: sub.pid,
          userId: sub.profile.uid,
          username: sub.profile.username,
          category: sub.profile.category,
          includeHome: true,
          includeServices: true,
        });
        logCacheRevalidation('profile', sub.pid, 'worldline retry succeeded');
      }

      isRetry ? results.retried++ : results.renewed++;
    } else {
      // Charge failed
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: SubscriptionStatus.past_due },
      });

      if (!isRetry) {
        // First failure — remove featured status
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
      }

      results.failed++;
      results.errors.push(`${sub.pid}: ${result.status} - ${result.message}`);
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`${sub.pid}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function cancelExpiredSubscription(
  sub: Awaited<ReturnType<typeof prisma.subscription.findMany>>[number] & {
    profile: { id: string; uid: string; username: string | null; category: string | null };
  },
  now: Date,
) {
  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: SubscriptionStatus.canceled,
        canceledAt: now,
        plan: SubscriptionPlan.free,
      },
    }),
    prisma.profile.update({
      where: { id: sub.pid },
      data: { featured: false },
    }),
  ]);

  await revalidateProfile({
    profileId: sub.pid,
    userId: sub.profile.uid,
    username: sub.profile.username,
    category: sub.profile.category,
    includeHome: true,
    includeServices: true,
  });
  logCacheRevalidation('profile', sub.pid, 'worldline subscription canceled after failed retries');
  console.log(`[Worldline Renewals] Canceled subscription for ${sub.pid} after ${MAX_RETRY_ATTEMPTS} failed retries`);
}
