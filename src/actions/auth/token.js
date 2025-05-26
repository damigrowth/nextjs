'use server';

import { cookies } from 'next/headers';

const TOKEN_NAME = 'jwt';

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

/**
 * Get the JWT token from cookies
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  const cookieStore = await cookies();
  const token = (await cookieStore.get(TOKEN_NAME)?.value) ?? null;
  return token;
};

/**
 * Check if a user is authenticated by verifying token existence
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  const token = await getToken();
  return Boolean(token);
};

/**
 * Set the JWT token in cookies
 * @param {string} token - The JWT token to set
 * @param {Object} options - Optional cookie configuration overrides
 */
export const setToken = async (token, options = {}) => {
  const cookieStore = await cookies();
  await cookieStore.set(TOKEN_NAME, token, {
    ...cookieConfig,
    ...options,
  });
};

/**
 * Remove the JWT token from cookies
 */
export const removeToken = async () => {
  const cookieStore = await cookies();
  await cookieStore.set(TOKEN_NAME, '', {
    ...cookieConfig,
    maxAge: 0,
  });
};

/**
 * Get authorization header value for API requests
 * @returns {Promise<Object>}
 */
export const getAuthHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get token from request cookies (useful in middleware)
 * @param {Request} request - The incoming request object
 * @returns {string|null}
 */
export const getTokenFromRequest = async (request) => {
  // The 'request' object itself contains the cookies, no need to await it.
  // console.log('Request', request); // Keep this for debugging if needed
  return request.cookies.get(TOKEN_NAME)?.value ?? null;
};
