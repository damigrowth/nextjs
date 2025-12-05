/**
 * Supabase Client Configuration
 * Used for real-time subscriptions with JWT authentication
 * Note: We use Better Auth for authentication, not Supabase Auth
 */

import { getSupabaseClient } from './client-jwt';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get JWT-aware Supabase client for real-time subscriptions
 * This client automatically includes the user's JWT for RLS policies
 *
 * Features:
 * - Timeout protection (5s max)
 * - Graceful degradation on auth failures
 * - Enhanced error logging
 *
 * @returns Promise<SupabaseClient | null> - JWT-authenticated client or null on failure
 */
export async function getRealtimeClient(): Promise<SupabaseClient | null> {
  try {
    // Create timeout promise (5 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Real-time client initialization timeout')), 5000);
    });

    // Race between client initialization and timeout
    const client = await Promise.race([
      getSupabaseClient(),
      timeoutPromise,
    ]);

    return client;
  } catch (error) {
    // Enhanced error logging with context
    const timestamp = new Date().toISOString();

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.warn(`[Realtime Client Timeout ${timestamp}]`, {
          reason: 'Auth initialization took too long (>5s)',
          fallback: 'Real-time features disabled',
        });
      } else if (error.message.includes('token') || error.message.includes('auth')) {
        console.warn(`[Realtime Client Auth Error ${timestamp}]`, {
          reason: error.message,
          fallback: 'Real-time features disabled',
        });
      } else {
        console.error(`[Realtime Client Error ${timestamp}]`, {
          error: error.message,
          stack: error.stack,
        });
      }
    } else {
      console.error(`[Realtime Client Unknown Error ${timestamp}]`, error);
    }

    return null;
  }
}

/**
 * @deprecated Use getRealtimeClient() instead for JWT-authenticated real-time subscriptions
 */
export const supabase = null;
