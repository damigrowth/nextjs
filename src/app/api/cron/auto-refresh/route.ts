import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { CACHE_TAGS } from '@/lib/cache';
import { revalidateTag } from 'next/cache';

/**
 * Auto-refresh all published services for promoted subscribers.
 * Should be called once daily by a cron job.
 * Protected by API key in Authorization header.
 *
 * Uses same refreshedAt/sortDate pattern as refresh-service.ts
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.AUTO_REFRESH_CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all active promoted subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { plan: SubscriptionPlan.promoted, status: SubscriptionStatus.active },
      select: { pid: true },
    });

    const profileIds = activeSubscriptions.map((s) => s.pid);

    if (profileIds.length === 0) {
      return NextResponse.json({ refreshed: 0 });
    }

    // Refresh all published services for these profiles
    // Same fields as refresh-service.ts: refreshedAt + sortDate
    const result = await prisma.service.updateMany({
      where: {
        pid: { in: profileIds },
        status: 'published',
      },
      data: {
        refreshedAt: now,
        sortDate: now,
      },
    });

    // Invalidate service caches
    revalidateTag(CACHE_TAGS.collections.services);
    revalidateTag(CACHE_TAGS.archive.all);

    return NextResponse.json({
      refreshed: result.count,
      profiles: profileIds.length,
    });
  } catch (error) {
    console.error('Auto-refresh cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
