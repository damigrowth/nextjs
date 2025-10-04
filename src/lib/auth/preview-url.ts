/**
 * Vercel Preview URL Detection and Storage for Google OAuth
 *
 * Google OAuth doesn't support wildcards in redirect URIs, so we can't add
 * all Vercel preview URLs. This utility detects preview deployments and stores
 * the URL in localStorage, then redirects back after OAuth completes.
 */

const PREVIEW_URL_KEY = 'oauth_preview_url';

/**
 * Checks if current URL is a Vercel preview deployment
 */
export function isPreviewDeployment(): boolean {
  if (typeof window === 'undefined') return false;

  const currentUrl = window.location.origin;

  // Check if it's a Vercel preview URL but not production
  return currentUrl.includes('vercel.app') && !currentUrl.includes('doulitsa.gr');
}

/**
 * Saves the current preview URL to localStorage for OAuth callback
 */
export function savePreviewUrl(): void {
  if (isPreviewDeployment()) {
    localStorage.setItem(PREVIEW_URL_KEY, window.location.origin);
  }
}

/**
 * Gets the saved preview URL from localStorage
 */
export function getSavedPreviewUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PREVIEW_URL_KEY);
}

/**
 * Clears the saved preview URL from localStorage
 */
export function clearSavedPreviewUrl(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREVIEW_URL_KEY);
}

/**
 * Gets the appropriate callback URL for OAuth
 * - Returns saved preview URL if exists
 * - Otherwise returns production URL (for Google OAuth config)
 */
export function getOAuthCallbackUrl(path: string = '/dashboard'): string {
  const savedPreviewUrl = getSavedPreviewUrl();

  if (savedPreviewUrl) {
    return `${savedPreviewUrl}${path}`;
  }

  // Default to production URL (configured in Google Console)
  return `https://doulitsa.gr${path}`;
}
