/**
 * Supabase Real-time Subscription Utilities
 * Typed helpers for subscribing to database changes with JWT authentication
 */

import { getRealtimeClient } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to new messages in a specific chat
 * Requires user to be authenticated (JWT) for RLS policies
 */
export async function subscribeToMessages(
  chatId: string,
  onNewMessage: (message: any) => void,
  onMessageUpdate: (message: any) => void,
  onMessageDelete: (messageId: string) => void
): Promise<RealtimeChannel | null> {
  const supabase = await getRealtimeClient();

  if (!supabase) {
    console.warn('Supabase client not initialized. Real-time features disabled.');
    return null;
  }

  // Use unique channel name with timestamp to avoid conflicts
  const channelName = `chat-${chatId}-${Date.now()}`;

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
    .subscribe();

  return channel;
}

/**
 * Subscribe to read receipts for messages in a chat
 * Requires user to be authenticated (JWT) for RLS policies
 */
export async function subscribeToReadReceipts(
  chatId: string,
  onReadReceipt: (messageId: string, userId: string) => void
): Promise<RealtimeChannel | null> {
  const supabase = await getRealtimeClient();

  if (!supabase) {
    console.warn('Supabase client not initialized. Real-time features disabled.');
    return null;
  }

  // Use unique channel name with timestamp
  const channelName = `read-receipts-${chatId}-${Date.now()}`;

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
    .subscribe();

  return channel;
}

/**
 * Subscribe to presence changes for chat members
 * Requires user to be authenticated (JWT) for RLS policies
 */
export async function subscribeToChatMemberPresence(
  chatId: string,
  onPresenceChange: (userId: string, online: boolean, lastSeen: Date) => void
): Promise<RealtimeChannel | null> {
  const supabase = await getRealtimeClient();

  if (!supabase) {
    console.warn('Supabase client not initialized. Real-time features disabled.');
    return null;
  }

  // Use unique channel name with timestamp
  const channelName = `presence-${chatId}-${Date.now()}`;

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
    .subscribe();

  return channel;
}

/**
 * Subscribe to all chats for a user (for chat list updates)
 * Requires user to be authenticated (JWT) for RLS policies
 */
export async function subscribeToUserChats(
  userId: string,
  onChatUpdate: (chat: any) => void
): Promise<RealtimeChannel | null> {
  const supabase = await getRealtimeClient();

  if (!supabase) {
    console.warn('Supabase client not initialized. Real-time features disabled.');
    return null;
  }

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
    .subscribe();

  return channel;
}

/**
 * Unsubscribe and remove a channel
 */
export async function unsubscribe(channel: RealtimeChannel | null): Promise<void> {
  if (!channel) return;

  const supabase = await getRealtimeClient();
  if (!supabase) return;

  await supabase.removeChannel(channel);
}
