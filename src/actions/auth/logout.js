'use server';

import { redirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';

import { removeToken } from './token';

/**
 * Server action to handle user logout.
 * Removes the JWT token, revalidates freelancer data, and redirects to the login page.
 *
 * @returns {Promise<void>} Redirects the user.
 */
export async function logout() {
  await removeToken();
  
  // Trigger client-side refetch of freelancer data
  revalidateTag('freelancer');
  
  redirect('/login');
}
