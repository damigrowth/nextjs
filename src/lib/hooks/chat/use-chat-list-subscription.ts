/**
 * React Hook: useChatListSubscription
 * Real-time updates for user's chat list
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { subscribeToUserChats, unsubscribe } from '@/lib/supabase/realtime';
import { getChats } from '@/actions/messages';
import type { ChatListItem } from '@/lib/types/messages';

interface UseChatListSubscriptionOptions {
  userId: string;
  initialChats: ChatListItem[];
  enabled?: boolean;
}

export function useChatListSubscription({
  userId,
  initialChats,
  enabled = true,
}: UseChatListSubscriptionOptions) {
  const [chats, setChats] = useState<ChatListItem[]>(initialChats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh chats from server
  const refreshChats = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const updatedChats = await getChats(userId);
      setChats(updatedChats);
    } catch (error) {
      console.error('Failed to refresh chats:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, isRefreshing]);

  // Subscribe to chat updates
  useEffect(() => {
    if (!enabled || !userId) return;

    let channel: RealtimeChannel | null = null;
    let mounted = true;

    // Subscribe to user chats (async function)
    const setupSubscription = async () => {
      // console.log('🔌 Subscribing to chat list for user:', userId);

      channel = await subscribeToUserChats(userId, (updatedChat) => {
        // console.log('💬 Chat list update received:', updatedChat);
        // When any chat-related change happens, refresh the entire list
        // This ensures we get accurate unread counts, last messages, etc.
        refreshChats();
      });

      // Check if component unmounted during async setup
      if (!mounted && channel) {
        // console.log('⚠️ Component unmounted during setup, cleaning up');
        await unsubscribe(channel);
      }
    };

    // Start async subscription setup
    setupSubscription().catch((error) => {
      console.error('❌ Failed to setup chat list subscription:', error);
    });

    // Cleanup
    return () => {
      // console.log('🧹 Cleanup: Starting for chat list');
      mounted = false;

      // Async cleanup - fire and forget
      (async () => {
        if (channel) {
          // console.log('🧹 Cleanup: Unsubscribing chat list channel');
          await unsubscribe(channel);
        }
        // console.log('✅ Cleanup: Complete for chat list');
      })();
    };
  }, [userId, enabled, refreshChats]);

  return {
    chats,
    refreshChats,
    isRefreshing,
  };
}
