import { cookies } from "next/headers";

const TOKEN_NAME = "jwt";

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

/**
 * Get the JWT token from cookies
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
  try {
    const cookieStore = cookies();
    return cookieStore.get(TOKEN_NAME)?.value ?? null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
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
  try {
    const cookieStore = cookies();
    cookieStore.set(TOKEN_NAME, token, {
      ...cookieConfig,
      ...options,
    });
  } catch (error) {
    console.error("Error setting auth token:", error);
    throw error;
  }
};

/**
 * Remove the JWT token from cookies
 */
export const removeToken = async () => {
  try {
    const cookieStore = cookies();
    cookieStore.set(TOKEN_NAME, "", {
      ...cookieConfig,
      maxAge: 0,
    });
  } catch (error) {
    console.error("Error removing auth token:", error);
    throw error;
  }
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
export const getTokenFromRequest = (request) => {
  return request.cookies.get(TOKEN_NAME)?.value ?? null;
};
