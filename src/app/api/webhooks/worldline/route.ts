import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import {
  SubscriptionProvider,
  SubscriptionStatus,
  SubscriptionPlan,
  BillingInterval,
} from '@prisma/client';
import { revalidateProfile, logCacheRevalidation } from '@/lib/cache';
import { getWorldlineSharedSecret } from '@/lib/payment/worldline-config';
import { validateResponseDigest } from '@/lib/payment/providers/worldline/digest';
import type { WorldlineResponseParams, WorldlineStatus } from '@/lib/payment/providers/worldline/types';

const baseUrl = () => process.env.BETTER_AUTH_URL || 'http://localhost:3000';

/**
 * Worldline/Cardlink payment callback handler.
 *
 * Cardlink POSTs the payment result to this URL when:
 * - Payment succeeds (status: CAPTURED/AUTHORIZED)
 * - User cancels (status: CANCELED)
 * - Payment refused (status: REFUSED)
 * - Error occurred (status: ERROR)
 *
 * This is both a webhook AND a user redirect — the user's browser
 * is redirected here with the result POSTed as form data.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();

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
    digest: (formData.get('digest') as string) || '',
  };

  // Read var1-var3 which we set in the request
  const profileId = (formData.get('var1') as string) || '';
  const plan = (formData.get('var2') as string) || 'promoted';
  const billingInterval = (formData.get('var3') as string) || 'month';

  // Validate digest
  const sharedSecret = getWorldlineSharedSecret();
  if (!sharedSecret) {
    console.error('[Worldline Webhook] Shared secret not configured');
    return NextResponse.redirect(`${baseUrl()}/dashboard/checkout?error=config`);
  }

  if (!validateResponseDigest(params, sharedSecret)) {
    console.error('[Worldline Webhook] Digest validation failed for order:', params.orderid);
    return NextResponse.redirect(`${baseUrl()}/dashboard/checkout?error=security`);
  }

  const status = params.status as WorldlineStatus;

  // Idempotency: check if this orderid was already processed
  if (status === 'CAPTURED' || status === 'AUTHORIZED') {
    const existing = await prisma.subscription.findFirst({
      where: { providerSubscriptionId: params.orderid },
    });
    if (existing) {
      console.log('[Worldline Webhook] Already processed order:', params.orderid);
      return NextResponse.redirect(`${baseUrl()}/dashboard/subscription/success`);
    }
  }

  // Handle based on status
  if (status === 'CAPTURED' || status === 'AUTHORIZED') {
    await handlePaymentSuccess(params, profileId, plan, billingInterval);
    return NextResponse.redirect(`${baseUrl()}/dashboard/subscription/success`);
  }

  if (status === 'CANCELED') {
    console.log('[Worldline Webhook] Payment canceled by user:', params.orderid);
    return NextResponse.redirect(`${baseUrl()}/dashboard/checkout?canceled=true`);
  }

  // REFUSED or ERROR
  console.error(`[Worldline Webhook] Payment ${status}:`, params.message, 'Order:', params.orderid);
  return NextResponse.redirect(`${baseUrl()}/dashboard/checkout?error=payment`);
}

async function handlePaymentSuccess(
  params: WorldlineResponseParams,
  profileId: string,
  plan: string,
  billingInterval: string,
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
