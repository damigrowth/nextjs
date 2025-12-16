import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authClient } from '@/lib/auth/client';

/**
 * Supabase Client with Better Auth JWT Integration
 *
 * This client automatically exchanges Better Auth JWT tokens for
 * Supabase-signed JWT tokens to enable Row Level Security (RLS) policies.
 *
 * Usage:
 * ```typescript
 * const supabase = await getSupabaseClient();
 * const { data, error } = await supabase.from('users').select('*');
 * ```
 */

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
  );
}

// Token cache to avoid unnecessary exchanges
interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Exchange Better Auth JWT for Supabase JWT with retry logic
 * @param betterAuthJWT - Better Auth JWT token
 * @param retryCount - Current retry attempt (default: 0, max: 2)
 */
async function exchangeToken(betterAuthJWT: string, retryCount = 0): Promise<string> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY_MS = 1000; // 1 second

  try {
    // Add timeout to fetch call (5 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/api/auth/exchange-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: betterAuthJWT }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    // Enhanced error logging
    const timestamp = new Date().toISOString();

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`[Token Exchange Timeout ${timestamp}]`, {
          attempt: retryCount + 1,
          maxRetries: MAX_RETRIES,
        });
      } else {
        console.error(`[Token Exchange Error ${timestamp}]`, {
          error: error.message,
          attempt: retryCount + 1,
          maxRetries: MAX_RETRIES,
        });
      }
    }

    // Retry with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // 1s, 2s
      console.info(`[Token Exchange Retry ${timestamp}]`, {
        retrying: true,
        delayMs: delay,
        attempt: retryCount + 2,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
      return exchangeToken(betterAuthJWT, retryCount + 1);
    }

    // Max retries exceeded
    throw error;
  }
}

/**
 * Get Supabase JWT (with caching and enhanced error handling)
 */
async function getSupabaseJWT(): Promise<string | null> {
  // Check cache first
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  try {
    // Get Better Auth session (with error handling)
    const session = await authClient.getSession();

    if (!session?.data?.session) {
      // No session - return null (anonymous access)
      // This is normal for logged-out users, no warning needed
      tokenCache = null;
      return null;
    }

    // Get Better Auth JWT from session
    const betterAuthJWT = session.data.session.token;

    if (!betterAuthJWT) {
      const timestamp = new Date().toISOString();
      console.warn(`[JWT Client Warning ${timestamp}]`, {
        reason: 'Session exists but no JWT token found',
        fallback: 'Using anonymous access',
      });
      tokenCache = null;
      return null;
    }

    try {
      // Exchange for Supabase JWT (with retry logic built-in)
      const supabaseJWT = await exchangeToken(betterAuthJWT);

      // Cache the token (expires in 14 minutes, refresh 1 minute before)
      tokenCache = {
        token: supabaseJWT,
        expiresAt: Date.now() + (14 * 60 * 1000), // 14 minutes
      };

      return supabaseJWT;
    } catch (error) {
      const timestamp = new Date().toISOString();

      if (error instanceof Error) {
        console.error(`[JWT Exchange Final Failure ${timestamp}]`, {
          reason: error.message,
          retriesExhausted: true,
          fallback: 'Using anonymous access',
        });
      }

      tokenCache = null;
      return null;
    }
  } catch (error) {
    // Catch errors from getSession() or getToken()
    const timestamp = new Date().toISOString();

    if (error instanceof Error) {
      console.error(`[JWT Client Error ${timestamp}]`, {
        stage: 'session_or_token_retrieval',
        error: error.message,
        fallback: 'Using anonymous access',
      });
    }

    tokenCache = null;
    return null;
  }
}

/**
 * Create Supabase client with Better Auth JWT integration
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  const supabaseJWT = await getSupabaseJWT();

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: supabaseJWT
        ? {
            Authorization: `Bearer ${supabaseJWT}`,
          }
        : {},
    },
    auth: {
      // Disable Supabase Auth (we're using Better Auth)
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Create anonymous Supabase client (for public access)
 */
export function getAnonSupabaseClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Clear token cache (call on logout)
 */
export function clearSupabaseTokenCache() {
  tokenCache = null;
}


