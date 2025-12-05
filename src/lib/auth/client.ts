import { createAuthClient } from 'better-auth/react';
import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import type { auth } from '@/lib/auth/config';

// Dynamic baseURL for Vercel deployments
const getBaseURL = () => {
  // Priority: Custom env var > Vercel URL > localhost
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // In browser, use current origin for Vercel preview deployments
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for SSR
  return process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    onError: (ctx) => {
      // Enhanced error logging for debugging
      const timestamp = new Date().toISOString();

      if (ctx.error && (ctx.error.code || ctx.error.message || ctx.error.status)) {
        // Structured HTTP error
        console.error(`[Auth Error ${timestamp}]`, {
          code: ctx.error.code,
          message: ctx.error.message,
          status: ctx.error.status,
          statusText: ctx.error.statusText,
        });
      } else if (ctx.error) {
        // Network/fetch error (error object exists but has no standard properties)
        console.error(`[Auth Network Error ${timestamp}]`, {
          type: 'network_failure',
          rawError: ctx.error,
          errorString: String(ctx.error),
        });
      } else {
        // Unknown error type
        console.error(`[Auth Unknown Error ${timestamp}]`, {
          type: 'unknown',
          context: ctx,
        });
      }
    },
    onSuccess: async (ctx) => {
      // Success logging disabled by default for performance
      // Uncomment for debugging: console.log('[Auth Success]', { endpoint: ctx.url });
    },
  },
  plugins: [
    adminClient(),
    apiKeyClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { useSession, signIn, signOut, signUp } = authClient;

// Auth utility functions
export const getSession = authClient.getSession;
export const updateUser = authClient.updateUser;

// Get session with fresh data from database (bypassing cookie cache)
export const getSessionFresh = () =>
  authClient.getSession({
    query: { disableCookieCache: true },
  });

// DEPRECATED: Custom session getter - replaced with official Better Auth patterns
// Use useSession() hook directly with refetch() for manual refreshes after profile updates
// export const getFreshSession = async (currentSession?: any) => {
//   const user = currentSession?.user;

//   // For recently registered users (< 10 minutes), use fresh data from database
//   const isRecentUser =
//     user?.createdAt &&
//     new Date().getTime() - new Date(user.createdAt).getTime() < 10 * 60 * 1000;

//   if (isRecentUser) {
//     // console.log('Recent user detected - fetching fresh session data');
//     return await getSessionFresh();
//   } else {
//     // console.log('Established user - using cached session data');
//     return currentSession
//       ? { data: currentSession }
//       : await authClient.getSession();
//   }
// };

// Email integration functions (can be used in auth flows)
export {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '@/lib/email';
