/**
 * Payment test mode utilities.
 * When PAYMENTS_TEST_MODE=true, only admin users or users with testUser=true
 * can access subscription features.
 * Integrates with existing RBAC system in @/lib/auth/roles and @/actions/auth/server.
 */

import { isAdminRole } from '@/lib/auth/roles';
import { getSession } from '@/actions/auth/server';

/**
 * Check if payments are in test mode
 */
export function isPaymentsTestMode(): boolean {
  return process.env.PAYMENTS_TEST_MODE === 'true';
}

/**
 * Check if current user can access payments in test mode.
 * Returns true if:
 * - Test mode is disabled (production), OR
 * - Test mode is enabled AND user has 'admin' role, OR
 * - Test mode is enabled AND user has testUser=true
 */
export async function canAccessPayments(): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const testMode = isPaymentsTestMode();

  // If not in test mode, everyone can access
  if (!testMode) {
    return { allowed: true };
  }

  // In test mode, check if user has 'admin' role using existing auth system
  const sessionResult = await getSession();

  if (!sessionResult.success || !sessionResult.data.session) {
    return {
      allowed: false,
      reason: 'Πρέπει να συνδεθείτε για να δείτε αυτή τη σελίδα',
    };
  }

  const user = sessionResult.data.session.user;

  // Only 'admin' role or testUser can access payments in test mode
  if (user.role !== 'admin' && !user.testUser) {
    return {
      allowed: false,
      reason:
        'Το σύστημα πληρωμών βρίσκεται σε δοκιμαστική λειτουργία. Μόνο διαχειριστές έχουν πρόσβαση αυτή τη στιγμή.',
    };
  }

  return { allowed: true };
}

/**
 * Get test mode banner message for admin or test users.
 * Returns null if not in test mode or user is neither admin nor testUser.
 */
export async function getTestModeBanner(): Promise<string | null> {
  if (!isPaymentsTestMode()) {
    return null;
  }

  // Only show banner to 'admin' users
  const sessionResult = await getSession();

  if (!sessionResult.success || !sessionResult.data.session) {
    return null;
  }

  const user = sessionResult.data.session.user;

  // Only admin or testUser sees the test mode banner
  if (user.role !== 'admin' && !user.testUser) {
    return null;
  }

  return '🧪 ΔΟΚΙΜΑΣΤΙΚΗ ΛΕΙΤΟΥΡΓΙΑ: Χρησιμοποιείτε δοκιμαστικές κάρτες Stripe. Οι πληρωμές δεν είναι πραγματικές.';
}
