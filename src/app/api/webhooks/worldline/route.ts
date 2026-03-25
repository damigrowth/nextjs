import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import {
  SubscriptionProvider,
  SubscriptionStatus,
  SubscriptionPlan,
  BillingInterval,
} from '@prisma/client';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { findCoupon } from '@/lib/payment/coupons';
import { getWorldlineSharedSecret } from '@/lib/payment/worldline-config';
import { validateResponseDigestFromFormData } from '@/lib/payment/providers/worldline/digest';
import type { WorldlineResponseParams, WorldlineStatus } from '@/lib/payment/providers/worldline/types';

const baseUrl = () => process.env.BETTER_AUTH_URL || 'http://localhost:3000';

/**
 * Worldline/Cardlink payment callback handler.
 *
 * Handles three types of POSTs from Cardlink:
 *
 * 1. Initial payment result (browser redirect):
 *    - Payment succeeds (status: CAPTURED/AUTHORIZED)
 *    - User cancels (status: CANCELED)
 *    - Payment refused (status: REFUSED)
 *    - Error occurred (status: ERROR)
 *
 * 2. Scheduled recurring child notification (server-to-server):
 *    - Auto-charge by Cardlink every billing period
 *    - Identified by Sequence field >= 2
 *    - Returns JSON (no browser redirect)
 *
 * 3. Background confirmation (server-to-server, user-agent: "Modirum VPOS" or "Modirum HTTPClient"):
 *    - Duplicate of initial payment for reliability
 *    - May use non-form Content-Type (parsed as URL-encoded text)
 */
export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const isServerToServer = userAgent.includes('Modirum');
  const contentType = request.headers.get('content-type') || '';

  let formData: FormData;

  // Modirum HTTPClient may send with non-form Content-Type (e.g. text/plain).
  // Detect and parse body as URL-encoded text in that case.
  const isFormContentType =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  if (isFormContentType) {
    try {
      formData = await request.formData();
    } catch (error) {
      if (isServerToServer) {
        console.warn('[Worldline Webhook] Background confirmation parse failed, acknowledging');
        return NextResponse.json({ status: 'ok', message: 'parse failed, acknowledged' });
      }
      console.error('[Worldline Webhook] formData() failed:', error);
      return NextResponse.redirect(`${baseUrl()}/payment/callback?error=payment`);
    }
  } else if (isServerToServer) {
    // Non-standard Content-Type from Modirum — try parsing body as URL-encoded text
    try {
      const bodyText = await request.text();
      const urlParams = new URLSearchParams(bodyText);
      formData = new FormData();
      urlParams.forEach((value, key) => formData.append(key, value));
    } catch {
      console.warn('[Worldline Webhook] Background confirmation unknown format, acknowledging');
      return NextResponse.json({ status: 'ok', message: 'unknown format, acknowledged' });
    }
  } else {
    console.error('[Worldline Webhook] Unexpected Content-Type:', contentType);
    return NextResponse.redirect(`${baseUrl()}/payment/callback?error=payment`);
  }

  // Parse response parameters
  const params: WorldlineResponseParams = {
    mid: (formData.get('mid') as string) || '',
    orderid: (formData.get('orderid') as string) || '',
    status: (formData.get('status') as string) || '',
    orderAmount: (formData.get('orderAmount') as string) || '',
    currency: (formData.get('currency') as string) || '',
    paymentTotal: (formData.get('paymentTotal') as string) || '',
    message: (formData.get('message') as string) || '',
    riskScore: (formData.get('riskScore') as string) || '',
    payMethod: (formData.get('payMethod') as string) || '',
    txId: (formData.get('txId') as string) || '',
    paymentRef: (formData.get('paymentRef') as string) || '',
    extToken: (formData.get('extToken') as string) || undefined,
    extTokenPanEnd: (formData.get('extTokenPanEnd') as string) || undefined,
    extTokenExp: (formData.get('extTokenExp') as string) || undefined,
    Sequence: (formData.get('Sequence') as string) || undefined,
    SeqTxId: (formData.get('SeqTxId') as string) || undefined,
    digest: (formData.get('digest') as string) || '',
  };

  // Validate digest
  const sharedSecret = getWorldlineSharedSecret();
  if (!sharedSecret) {
    console.error('[Worldline Webhook] Shared secret not configured');
    return NextResponse.redirect(`${baseUrl()}/payment/callback?error=config`);
  }

  if (!validateResponseDigestFromFormData(formData, sharedSecret)) {
    // For background confirmations, if order already processed, acknowledge silently
    if (isServerToServer && params.orderid) {
      const alreadyProcessed = await prisma.subscription.findFirst({
        where: { providerSubscriptionId: params.orderid, status: SubscriptionStatus.active },
        select: { id: true },
      });
      if (alreadyProcessed) {
        console.warn('[Worldline Webhook] Digest mismatch on background confirmation, order already processed:', params.orderid);
        return NextResponse.json({ status: 'ok', message: 'already processed' });
      }
    }
    console.error('[Worldline Webhook] Digest validation failed for order:', params.orderid);
    if (isServerToServer) {
      return NextResponse.json({ status: 'error', message: 'digest validation failed' }, { status: 400 });
    }
    return NextResponse.redirect(`${baseUrl()}/payment/callback?error=security`);
  }

  // Recurring child notification (Sequence >= 2 = auto-charge by Cardlink)
  const sequence = params.Sequence ? parseInt(params.Sequence) : 0;
  if (sequence >= 2) {
    return handleRecurringChild(params, sequence);
  }

  // --- Initial (parent) payment handling below ---

  // Cardlink does NOT return var1-var9 in the response.
  // Recover profileId/plan/interval from the pending subscription stored during checkout.
  let profileId = (formData.get('var1') as string) || '';
  let plan = (formData.get('var2') as string) || 'promoted';
  let billingInterval = (formData.get('var3') as string) || 'month';
  let couponCode = (formData.get('var4') as string) || '';

  if (!profileId && params.orderid) {
    const pending = await prisma.subscription.findFirst({
      where: { providerSubscriptionId: params.orderid },
      select: { pid: true, billingInterval: true, discountCode: true },
    });
    if (pending) {
      profileId = pending.pid;
      billingInterval = pending.billingInterval || 'month';
      if (!couponCode && pending.discountCode) {
        couponCode = pending.discountCode;
      }
    }
  }

  const status = params.status as WorldlineStatus;

  // Detect background confirmation (server-to-server, no browser)
  const isBackgroundConfirmation = isServerToServer;

  // Idempotency: check if this orderid was already processed (status already active)
  if (status === 'CAPTURED' || status === 'AUTHORIZED') {
    const existing = await prisma.subscription.findFirst({
      where: {
        providerSubscriptionId: params.orderid,
        status: SubscriptionStatus.active,
      },
    });
    if (existing) {
      if (isBackgroundConfirmation) {
        return NextResponse.json({ status: 'ok', message: 'already processed' });
      }
      return NextResponse.redirect(`${baseUrl()}/payment/callback?status=success`);
    }
  }

  // Handle based on status
  if (status === 'CAPTURED' || status === 'AUTHORIZED') {
    await handlePaymentSuccess(params, profileId, plan, billingInterval, couponCode);
    if (isBackgroundConfirmation) {
      return NextResponse.json({ status: 'ok' });
    }
    return NextResponse.redirect(`${baseUrl()}/payment/callback?status=success`);
  }

  if (status === 'CANCELED') {
    console.log('[Worldline Webhook] Payment canceled by user:', params.orderid);
    if (isBackgroundConfirmation) {
      return NextResponse.json({ status: 'canceled' });
    }
    return NextResponse.redirect(`${baseUrl()}/payment/callback?canceled=true`);
  }

  // REFUSED or ERROR
  console.error(`[Worldline Webhook] Payment ${status}:`, params.message, 'Order:', params.orderid);
  if (isBackgroundConfirmation) {
    return NextResponse.json({ status: 'error', message: params.message });
  }
  return NextResponse.redirect(`${baseUrl()}/payment/callback?error=payment`);
}

async function handlePaymentSuccess(
  params: WorldlineResponseParams,
  profileId: string,
  plan: string,
  billingInterval: string,
  couponCode?: string,
) {
  if (!profileId) {
    console.error('[Worldline Webhook] No profileId in payment response');
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  if (billingInterval === 'year') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  // Amount in cents for consistency with Stripe
  const amountCents = Math.round(parseFloat(params.orderAmount) * 100);

  // Resolve coupon for discount tracking
  const coupon = couponCode ? findCoupon(couponCode) : null;

  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { uid: true, username: true, category: true, billing: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.subscription.upsert({
      where: { pid: profileId },
      create: {
        pid: profileId,
        provider: SubscriptionProvider.worldline,
        providerCustomerId: params.mid,
        providerSubscriptionId: params.orderid,
        worldlineToken: params.extToken || null,
        worldlineTokenExp: params.extTokenExp || null,
        worldlineMasterOrderId: params.orderid,
        plan: plan === 'promoted' ? SubscriptionPlan.promoted : SubscriptionPlan.free,
        status: SubscriptionStatus.active,
        billingInterval: billingInterval === 'year' ? BillingInterval.year : BillingInterval.month,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        billing: profile?.billing ?? null,
        amount: amountCents,
        currency: params.currency.toLowerCase(),
        paymentMethodType: 'card',
        paymentMethodLast4: params.extTokenPanEnd || null,
        paymentMethodBrand: params.payMethod || null,
        discountCode: coupon?.code || null,
        discountPercentOff: coupon?.percentOff || null,
        firstPaymentAt: now,
        lastPaymentAt: now,
        paymentCount: 1,
        totalPaidLifetime: amountCents,
      },
      update: {
        provider: SubscriptionProvider.worldline,
        providerSubscriptionId: params.orderid,
        worldlineToken: params.extToken || null,
        worldlineTokenExp: params.extTokenExp || null,
        worldlineMasterOrderId: params.orderid,
        plan: SubscriptionPlan.promoted,
        status: SubscriptionStatus.active,
        billingInterval: billingInterval === 'year' ? BillingInterval.year : BillingInterval.month,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        billing: profile?.billing ?? null,
        amount: amountCents,
        currency: params.currency.toLowerCase(),
        paymentMethodType: 'card',
        paymentMethodLast4: params.extTokenPanEnd || null,
        paymentMethodBrand: params.payMethod || null,
        discountCode: coupon?.code || null,
        discountPercentOff: coupon?.percentOff || null,
        lastPaymentAt: now,
        paymentCount: { increment: 1 },
        totalPaidLifetime: { increment: amountCents },
      },
    });

    await tx.profile.update({
      where: { id: profileId },
      data: { featured: true },
    });
  });

  if (profile) {
    await revalidateProfile({
      profileId,
      userId: profile.uid,
      username: profile.username,
      category: profile.category,
      includeHome: true,
      includeServices: true,
    });
    logCacheRevalidation('profile', profileId, 'worldline subscription activated');
  }
}

/**
 * Handle scheduled recurring child notification from Cardlink.
 * These are server-to-server POSTs (no browser) sent automatically each billing period.
 */
async function handleRecurringChild(
  params: WorldlineResponseParams,
  sequence: number,
): Promise<NextResponse> {
  const status = params.status as WorldlineStatus;

  // Cardlink appends "/N" to orderid for children (e.g. "DOL...abc/2").
  // The master orderId is the part before the slash.
  const masterOrderId = params.orderid.includes('/')
    ? params.orderid.split('/')[0]
    : params.orderid;

  const subscription = await prisma.subscription.findFirst({
    where: {
      provider: SubscriptionProvider.worldline,
      worldlineMasterOrderId: masterOrderId,
    },
    include: {
      profile: { select: { id: true, uid: true, username: true, category: true } },
    },
  });

  if (!subscription) {
    console.error(`[Worldline Recurring] No subscription for order: ${masterOrderId}`);
    return NextResponse.json({ status: 'error', message: 'Subscription not found' }, { status: 404 });
  }

  if (status === 'CAPTURED' || status === 'AUTHORIZED') {
    const now = new Date();
    const billingInterval = subscription.billingInterval || BillingInterval.month;
    const newPeriodStart = subscription.currentPeriodEnd || now;
    const newPeriodEnd = new Date(newPeriodStart);

    if (billingInterval === BillingInterval.year) {
      newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
    } else {
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
    }

    const amountCents = Math.round(parseFloat(params.orderAmount) * 100);

    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: SubscriptionStatus.active,
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          lastPaymentAt: now,
          paymentCount: { increment: 1 },
          totalPaidLifetime: { increment: amountCents },
          amount: amountCents,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      });

      await tx.profile.update({
        where: { id: subscription.pid },
        data: { featured: true },
      });
    });

    if (subscription.profile) {
      await revalidateProfile({
        profileId: subscription.pid,
        userId: subscription.profile.uid,
        username: subscription.profile.username,
        category: subscription.profile.category,
        includeHome: true,
        includeServices: true,
      });
      logCacheRevalidation('profile', subscription.pid, `worldline recurring child #${sequence}`);
    }

    console.log(`[Worldline Recurring] Child #${sequence} succeeded for ${subscription.pid}`);
    return NextResponse.json({ status: 'ok', sequence });
  }

  // Failed recurring child (REFUSED/ERROR)
  console.error(`[Worldline Recurring] Child #${sequence} failed: ${status} - ${params.message}`);

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: SubscriptionStatus.past_due },
  });

  await prisma.profile.update({
    where: { id: subscription.pid },
    data: { featured: false },
  });

  if (subscription.profile) {
    await revalidateProfile({
      profileId: subscription.pid,
      userId: subscription.profile.uid,
      username: subscription.profile.username,
      category: subscription.profile.category,
      includeHome: true,
      includeServices: true,
    });
    logCacheRevalidation('profile', subscription.pid, `worldline recurring child #${sequence} failed`);
  }

  return NextResponse.json({ status: 'failed', sequence });
}
