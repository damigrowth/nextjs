'use server';

import { redirect } from 'next/navigation';

import { removeToken } from './token';

/**
 * Server action to handle user logout.
 * Removes the JWT token and redirects to the login page.
 *
 * @returns {Promise<void>} Redirects the user.
 */
export async function logout() {
  await removeToken();
  redirect('/login');
}
