/**
 * Supabase RLS Server Client with Session Variables
 *
 * Server-side RLS client for use in Server Actions and API routes.
 *
 * This is separated from client-rls.ts to prevent client-side module resolution
 * errors when importing server-only dependencies.
 *
 * Reference: Proven working solution by @insightautomate (Discord thread)
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase server client with RLS session variable set
 *
 * Server-side version for use in Server Actions and API routes.
 *
 * How it works:
 * 1. Create Supabase client
 * 2. Get current Better Auth session from server
 * 3. Call set_user_id() RPC to set PostgreSQL session variable
 * 4. Return client (session variable persists for connection lifecycle)
 *
 * Usage:
 * ```typescript
 * import { getSupabaseRlsServerClient } from '@/lib/supabase/server-rls';
 *
 * export async function sendMessage(data: MessageInput) {
 *   const supabase = await getSupabaseRlsServerClient();
 *   const { error } = await supabase.from('messages').insert(data);
 * }
 * ```
 *
 * @returns Supabase server client with user ID set in session variable
 * @throws Error if Supabase environment variables are missing or RPC call fails
 */
export async function getSupabaseRlsServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  // Import Better Auth instance
  const { auth } = await import('@/lib/auth');
  const { headers } = await import('next/headers');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      persistSession: false, // We use Better Auth, not Supabase Auth
    },
  });

  // Get Better Auth session from server
  const session = await auth.api.getSession({ headers: await headers() });

  // Set user ID in PostgreSQL session variable
  if (session?.user?.id) {
    const { error } = await supabase.rpc('set_user_id', {
      user_id: session.user.id,
    });

    if (error) {
      console.error('Failed to set user ID in session:', error);
      throw new Error(`Failed to initialize RLS server client: ${error.message}`);
    }
  } else {
    // No user session - return unauthenticated client
    // RLS policies will block access (as intended)
    console.warn(
      'No user session found - returning unauthenticated Supabase server client'
    );
  }

  return supabase;
}
