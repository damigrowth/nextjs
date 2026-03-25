'use server';

import { BillingInterval } from '@prisma/client';
import { findCoupon, calculateDiscountedPricing, type DiscountedPricing } from '@/lib/payment/coupons';
import type { ActionResult } from '@/lib/types/api';

/**
 * Validate a coupon code and return discounted pricing if applicable.
 * No auth required — lightweight validation with no DB access.
 */
export async function validateCoupon(input: {
  code: string;
  billingInterval: BillingInterval;
}): Promise<ActionResult<{ code: string; percentOff: number; pricing: DiscountedPricing }>> {
  try {
    const { code, billingInterval } = input;

    if (!code || !code.trim()) {
      return { success: false, error: 'Εισάγετε κωδικό κουπονιού' };
    }

    const coupon = findCoupon(code);
    if (!coupon) {
      return { success: false, error: 'Μη έγκυρο κουπόνι' };
    }

    // Calculate pricing for annual (coupon only applies to annual)
    const pricing = calculateDiscountedPricing(coupon, 'promoted', 'year');
    if (!pricing) {
      return { success: false, error: 'Το κουπόνι δεν μπορεί να εφαρμοστεί' };
    }

    return {
      success: true,
      data: { code: coupon.code, percentOff: coupon.percentOff, pricing },
    };
  } catch {
    return { success: false, error: 'Σφάλμα επαλήθευσης κουπονιού' };
  }
}
