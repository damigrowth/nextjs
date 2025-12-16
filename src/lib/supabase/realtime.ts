/**
 * Supabase Real-time Subscription Utilities with RLS Support
 *
 * IMPORTANT: Uses RLS-enabled Supabase client for proper Row Level Security.
 * All subscriptions now work with RLS policies using PostgreSQL session variables.
 *
 * How RLS works for Realtime:
 * - Client calls getSupabaseRlsClient() which sets user ID in session variable
 * - Realtime events are filtered by RLS policies using current_user_id()
 * - Session variable persists during Postgres replication (where Realtime operates)
 * - Users only receive events for data they have access to
 */

import { getSupabaseRlsClient } from './client-rls';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to new messages in a specific chat
 *
 * RLS Policy: Users can only receive messages from chats they're members of
 */
export async function subscribeToMessages(
  chatId: string,
  onNewMessage: (message: any) => void,
  onMessageUpdate: (message: any) => void,
  onMessageDelete: (messageId: string) => void
): Promise<RealtimeChannel | null> {
  try {
    // Get RLS-enabled Supabase client
    // This sets user ID in session variable for RLS policies
    const supabase = await getSupabaseRlsClient();

    // Use deterministic channel name (no timestamp) so all clients listen to same channel
    const channelName = `chat-${chatId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chatId=eq.${chatId}`,
        },
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chatId=eq.${chatId}`,
        },
        (payload) => {
          onMessageUpdate(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chatId=eq.${chatId}`,
        },
        (payload) => {
          onMessageDelete(payload.old.id);
        }
      )
      .subscribe((status, err) => {
        // Only log actual errors, not transient timeout during connection
        if (status === 'CHANNEL_ERROR' && err) {
          console.error('Channel error:', err);
        }
        // TIMED_OUT is normal during initial connection with custom auth - ignore it
      });

    return channel;
  } catch (error) {
    console.error('Failed to subscribe to messages:', error);
    return null;
  }
}

/**
 * Subscribe to read receipts for messages in a chat
 *
 * RLS Policy: Users can only receive read receipts from chats they're members of
 */
export async function subscribeToReadReceipts(
  chatId: string,
  onReadReceipt: (messageId: string, userId: string) => void
): Promise<RealtimeChannel | null> {
  try {
    // Get RLS-enabled Supabase client
    const supabase = await getSupabaseRlsClient();

    // Use deterministic channel name (no timestamp)
    const channelName = `read-receipts-${chatId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reads',
        },
        (payload) => {
          onReadReceipt(payload.new.messageId, payload.new.uid);
        }
      )
      .subscribe((status, err) => {
        // Only log actual errors with messages, ignore transient timeouts
        if (status === 'CHANNEL_ERROR' && err) {
          console.error('Read receipts subscription error:', err);
        }
      });

    return channel;
  } catch (error) {
    console.error('Failed to subscribe to read receipts:', error);
    return null;
  }
}

/**
 * Subscribe to presence changes for chat members
 *
 * RLS Policy: Users can only receive presence updates from chats they're members of
 */
export async function subscribeToChatMemberPresence(
  chatId: string,
  onPresenceChange: (userId: string, online: boolean, lastSeen: Date) => void
): Promise<RealtimeChannel | null> {
  try {
    // Get RLS-enabled Supabase client
    const supabase = await getSupabaseRlsClient();

    // Use deterministic channel name (no timestamp)
    const channelName = `presence-${chatId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_members',
          filter: `chatId=eq.${chatId}`,
        },
        (payload) => {
          onPresenceChange(
            payload.new.uid,
            payload.new.online,
            new Date(payload.new.lastSeen)
          );
        }
      )
      .subscribe((status, err) => {
        // Only log actual errors with messages, ignore transient timeouts
        if (status === 'CHANNEL_ERROR' && err) {
          console.error('Presence subscription error:', err);
        }
      });

    return channel;
  } catch (error) {
    console.error('Failed to subscribe to chat member presence:', error);
    return null;
  }
}

/**
 * Subscribe to all chats for a user (for chat list updates)
 *
 * RLS Policy: Users only receive updates for chats they're members of
 */
export async function subscribeToUserChats(
  userId: string,
  onChatUpdate: (chat: any) => void
): Promise<RealtimeChannel | null> {
  try {
    // Get RLS-enabled Supabase client
    const supabase = await getSupabaseRlsClient();

    const channel = supabase
      .channel(`user-chats-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // All events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'chats',
        },
        (payload) => {
          onChatUpdate(payload.new || payload.old);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_members',
        },
        (payload) => {
          onChatUpdate(payload.new || payload.old);
        }
      )
      .subscribe((status, err) => {
        // Only log actual errors with messages, ignore transient timeouts
        if (status === 'CHANNEL_ERROR' && err) {
          console.error('User chats subscription error:', err);
        }
      });

    return channel;
  } catch (error) {
    console.error('Failed to subscribe to user chats:', error);
    return null;
  }
}

/**
 * Unsubscribe and remove a channel
 *
 * @param channel - The channel to unsubscribe from
 * @param supabaseClient - Optional Supabase client (if not provided, creates new RLS client)
 */
export async function unsubscribe(
  channel: RealtimeChannel | null,
  supabaseClient?: any
): Promise<void> {
  if (!channel) return;

  try {
    // Use provided client or get new RLS client
    const supabase = supabaseClient || await getSupabaseRlsClient();
    await supabase.removeChannel(channel);
  } catch (error) {
    console.error('Failed to unsubscribe channel:', error);
  }
}
