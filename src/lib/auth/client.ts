import { createAuthClient } from 'better-auth/react';
import { adminClient, apiKeyClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  fetchOptions: {
    onError: (ctx) => {
      console.log('Auth Client Error Context:', ctx);
      
      // Log detailed error information for debugging
      if (ctx.error) {
        console.error('Auth Error Details:', {
          code: ctx.error.code,
          message: ctx.error.message,
          status: ctx.error.status,
          statusText: ctx.error.statusText,
        });
      }
    },
    onSuccess: async (ctx) => {
      console.log('Auth Success:', ctx);
    },
  },
  plugins: [
    adminClient(),
    apiKeyClient(),
  ],
});

export const { useSession, signIn, signOut, signUp } = authClient;

// Auth utility functions
export const getSession = authClient.getSession;
export const updateUser = authClient.updateUser;
