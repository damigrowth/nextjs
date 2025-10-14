/**
 * ADMIN ACTION HELPERS
 * Shared utilities for admin server actions
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Get authenticated admin session
 * Throws error if user is not authenticated or not an admin
 * Redirects to login if no session exists
 */
export async function getAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'admin';

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin role required');
  }

  return session;
}
