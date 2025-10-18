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
  const [presenceMap, setPresenceMap] = useState<
    Map<string, PresenceState>
  >(new Map());

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
    if (chatId) {
      channel = subscribeToChatMemberPresence(
        chatId,
        (memberId, online, lastSeen) => {
          setPresenceMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(memberId, { online, lastSeen });
            return newMap;
          });
        }
      );
    }

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      clearTimeout(visibilityTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setOffline();
      if (channel) unsubscribe(channel);
    };
  }, [userId, chatId, enabled]);

  return { presenceMap };
}
