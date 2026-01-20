/**
 * Supabase RLS Client with Session Variables
 *
 * This client wrapper enables Row Level Security (RLS) policies to work with
 * both HTTP requests AND Realtime postgres_changes subscriptions.
 *
 * Problem:
 * - auth.jwt() works for HTTP (PostgREST sets request.jwt.claims)
 * - auth.jwt() FAILS for Realtime (NULL during Postgres replication)
 * - Result: RLS policies block realtime events, callbacks never fire
 *
 * Solution:
 * - Use PostgreSQL session variables instead of JWT claims
 * - Session variables persist for entire connection lifecycle
 * - Available during BOTH HTTP requests AND Postgres replication
 * - Client calls set_user_id() RPC once per connection
 * - RLS policies use current_user_id() function
 *
 * Reference: Proven working solution by @insightautomate (Discord thread)
 *
 * NOTE: Server-side RLS client is in server-rls.ts to prevent
 * client-side module resolution errors.
 */

import { createClient } from '@supabase/supabase-js';
import { authClient } from '@/lib/auth/client';

/**
 * Client cache to prevent multiple Supabase instances
 * Stores single client instance per user session
 */
let cachedClient: any = null;
let cachedUserId: string | null = null;

/**
 * Client version for cache invalidation
 * Increment this when making breaking changes to client setup (e.g., JWT implementation)
 * This forces creation of new client with updated configuration
 */
const CLIENT_VERSION = '2'; // v2: Added JWT token for Realtime authentication
let cachedClientVersion: string | null = null;

/**
 * Generates a custom JWT for Realtime authentication
 *
 * This JWT is used by Supabase Realtime to authenticate the websocket connection.
 * It's required when using custom auth (Better Auth) instead of Supabase Auth.
 *
 * The JWT structure follows standard Supabase format:
 * - iss: Issuer (Supabase project URL)
 * - sub: Subject (user ID)
 * - role: PostgreSQL role (authenticated)
 * - exp: Expiration (1 hour from now)
 *
 * NOTE: This is a temporary implementation using the anon key as the token.
 * For production, you should:
 * 1. Generate a proper JWT with your Supabase JWT secret
 * 2. Include user claims (sub, role, etc.)
 * 3. Set appropriate expiration
 *
 * Reference: https://supabase.com/docs/guides/realtime/postgres-changes#custom-tokens
 *
 * @param userId - Better Auth user ID
 * @returns JWT token string
 */
function generateCustomJwt(userId: string): string {
  // For now, use the anon key as the token
  // This works because:
  // 1. Anon key is a valid JWT signed with Supabase JWT secret
  // 2. It has role: 'anon' which has access to public tables
  // 3. RLS policies use session variables (current_user_id()) not JWT claims
  //
  // TODO: Generate proper JWT with user claims for production
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

/**
 * Creates a Supabase browser client with RLS session variable set
 *
 * IMPORTANT: This client must be used for ALL chat operations to ensure
 * RLS policies work correctly for both HTTP requests and Realtime subscriptions.
 *
 * How it works:
 * 1. Create Supabase browser client
 * 2. Get current Better Auth session
 * 3. Call set_user_id() RPC to set PostgreSQL session variable
 * 4. Return client (session variable persists for connection lifecycle)
 *
 * Usage:
 * ```typescript
 * const supabase = await getSupabaseRlsClient();
 * const { data } = await supabase.from('messages').select('*');
 * ```
 *
 * @returns Supabase browser client with user ID set in session variable
 * @throws Error if Supabase environment variables are missing or RPC call fails
 */
export async function getSupabaseRlsClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // Get current Better Auth session
  const session = await authClient.getSession();
  const currentUserId = session?.data?.user?.id || null;

  // Return cached client if:
  // 1. Client exists
  // 2. User hasn't changed (same user ID)
  // 3. Client version matches (invalidate cache on breaking changes)
  if (
    cachedClient &&
    cachedUserId === currentUserId &&
    cachedClientVersion === CLIENT_VERSION
  ) {
    return cachedClient;
  }

  // Create new client if:
  // - No cached client exists
  // - User changed (logged in/out/switched accounts)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      persistSession: false, // We use Better Auth, not Supabase Auth
    },
    global: {
      headers: currentUserId
        ? {
            Authorization: `Bearer ${supabaseAnonKey}`,
          }
        : {},
    },
  });

  // Set user ID in PostgreSQL session variable
  // This persists for the entire connection lifecycle (including Realtime replication)
  if (currentUserId) {
    const { error } = await supabase.rpc('set_user_id', {
      user_id: currentUserId,
    });

    if (error) {
      console.error('Failed to set user ID in session:', error);
      throw new Error(`Failed to initialize RLS client: ${error.message}`);
    }

    // Generate custom JWT for Realtime authentication
    // Required for Realtime to work with custom auth (Better Auth)
    // See: https://supabase.com/docs/guides/realtime/postgres-changes#custom-tokens
    const customJwt = generateCustomJwt(currentUserId);

    // CRITICAL: Set JWT for Realtime authentication
    // This is required in addition to session variables for Realtime to work
    supabase.realtime.setAuth(customJwt);
  }

  // Cache the client, user ID, and version
  cachedClient = supabase;
  cachedUserId = currentUserId;
  cachedClientVersion = CLIENT_VERSION;

  return supabase;
}

/**
 * Anonymous Supabase client for public data (no authentication required)
 *
 * This client does NOT set user ID in session variable.
 * Use for public content that doesn't require authentication.
 *
 * Usage:
 * ```typescript
 * const supabase = getAnonSupabaseClient();
 * const { data } = await supabase.from('public_services').select('*');
 * ```
 *
 * @returns Unauthenticated Supabase browser client
 * @throws Error if Supabase environment variables are missing
 */
export function getAnonSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Clears the cached Supabase RLS client
 *
 * Call this when user logs out or switches accounts to ensure
 * a fresh client is created with new session on next access.
 *
 * Usage:
 * ```typescript
 * import { clearSupabaseRlsClientCache } from '@/lib/supabase/client-rls';
 *
 * export async function logout() {
 *   await authClient.signOut();
 *   clearSupabaseRlsClientCache(); // Clear cached client
 *   router.push('/login');
 * }
 * ```
 */
export function clearSupabaseRlsClientCache() {
  cachedClient = null;
  cachedUserId = null;
  cachedClientVersion = null;
}
