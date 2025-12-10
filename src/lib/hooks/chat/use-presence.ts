/**
 * React Hook: usePresence
 * Manages user presence (online/offline) with automatic heartbeat
 */

'use client';

import { useEffect, useState } from 'react';
import { updatePresence } from '@/actions/messages';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  subscribeToChatMemberPresence,
  unsubscribe,
} from '@/lib/supabase/realtime';

interface UsePresenceOptions {
  userId: string;
  chatId?: string;
  enabled?: boolean;
}

interface PresenceState {
  online: boolean;
  lastSeen: Date;
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const VISIBILITY_CHANGE_DELAY = 2000; // 2 seconds

export function usePresence({
  userId,
  chatId,
  enabled = true,
}: UsePresenceOptions) {
  const [presenceMap, setPresenceMap] = useState<Map<string, PresenceState>>(
    new Map(),
  );

  // Set online on mount, offline on unmount
  useEffect(() => {
    if (!enabled || !userId) return;

    let heartbeatInterval: NodeJS.Timeout;
    let visibilityTimeout: NodeJS.Timeout;
    let channel: RealtimeChannel | null = null;

    // Set user online
    const setOnline = async () => {
      await updatePresence(userId, true);
    };

    // Set user offline
    const setOffline = async () => {
      await updatePresence(userId, false);
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tab/minimized - wait before setting offline
        visibilityTimeout = setTimeout(() => {
          setOffline();
        }, VISIBILITY_CHANGE_DELAY);
      } else {
        // User returned - clear timeout and set online
        clearTimeout(visibilityTimeout);
        setOnline();
      }
    };

    // Initial setup
    setOnline();

    // Start heartbeat to keep presence alive
    heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        setOnline();
      }
    }, HEARTBEAT_INTERVAL);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Subscribe to presence changes in chat (if chatId provided)
    let mounted = true;

    const setupPresenceSubscription = async () => {
      if (!chatId) return;

      // console.log('🔌 Subscribing to presence for chat:', chatId);

      channel = await subscribeToChatMemberPresence(
        chatId,
        (memberId, online, lastSeen) => {
          // console.log('👤 Presence update:', { memberId, online, lastSeen });
          setPresenceMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(memberId, { online, lastSeen });
            return newMap;
          });
        },
      );

      // Check if component unmounted during async setup
      if (!mounted && channel) {
        // console.log('⚠️ Component unmounted during setup, cleaning up');
        await unsubscribe(channel);
      }
    };

    // Start async subscription setup if chatId is provided
    if (chatId) {
      setupPresenceSubscription().catch((error) => {
        console.error('❌ Failed to setup presence subscription:', error);
      });
    }

    // Cleanup
    return () => {
      // console.log('🧹 Cleanup: Starting for presence');
      mounted = false;
      clearInterval(heartbeatInterval);
      clearTimeout(visibilityTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setOffline();

      // Async cleanup - fire and forget
      (async () => {
        if (channel) {
          // console.log('🧹 Cleanup: Unsubscribing presence channel');
          await unsubscribe(channel);
        }
        // console.log('✅ Cleanup: Complete for presence');
      })();
    };
  }, [userId, chatId, enabled]);

  return { presenceMap };
}
