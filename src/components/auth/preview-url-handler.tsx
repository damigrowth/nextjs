'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSavedPreviewUrl, clearSavedPreviewUrl } from '@/lib/auth/preview-url';

/**
 * Handles OAuth callback redirects for Vercel preview deployments
 *
 * Google OAuth doesn't support wildcards, so we:
 * 1. Save the preview URL before OAuth (in form-auth-login.tsx)
 * 2. OAuth redirects to production (configured in Google Console)
 * 3. This component detects we're on production with a saved preview URL
 * 4. Redirects back to the preview deployment with auth state
 */
export function PreviewUrlHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on production domain
    if (typeof window === 'undefined') return;

    const currentOrigin = window.location.origin;
    const isProduction = currentOrigin === 'https://doulitsa.gr';

    if (!isProduction) return;

    // Check if we have a saved preview URL
    const savedPreviewUrl = getSavedPreviewUrl();

    if (savedPreviewUrl) {
      // We're on production but came from a preview deployment
      // Redirect back to preview with current path and query params
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = `${savedPreviewUrl}${currentPath}`;

      // Clear the saved URL
      clearSavedPreviewUrl();

      // Redirect to preview deployment
      window.location.href = redirectUrl;
    }
  }, [pathname, router]);

  return null;
}
