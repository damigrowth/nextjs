import { NextResponse } from 'next/server';
import {
  canAccessPayments,
  getTestModeBanner,
} from '@/lib/payment/test-mode';

/**
 * API endpoint to check if user has access to payment features.
 * Used by client components to verify test mode access.
 */
export async function GET() {
  try {
    const [accessCheck, testModeBanner] = await Promise.all([
      canAccessPayments(),
      getTestModeBanner(),
    ]);

    return NextResponse.json({
      allowed: accessCheck.allowed,
      reason: accessCheck.reason,
      testModeBanner,
    });
  } catch (error) {
    // On error, allow access (fail open)
    return NextResponse.json({ allowed: true });
  }
}
